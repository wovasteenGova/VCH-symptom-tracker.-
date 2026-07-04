import type { SupabaseClient } from '@supabase/supabase-js'
import { buildLogReminderPayloads, DEFAULT_LOG_REMINDER_HOUR, resolveReminderTimezone } from '../../app/utils/logReminders'
import {
  isExpiredPushSubscriptionError,
  sendWebPushNotification,
  type PushSubscriptionRecord
} from './webPush'

export type ReminderCandidate = {
  userId: string
  dedupeKey: string
  title: string
  body: string
  subscriptions: PushSubscriptionRecord[]
}

export async function loadReminderCandidates(
  supabase: SupabaseClient,
  now = new Date()
) {
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('user_id, logging_cadence, weekly_log_day, reminder_hour, reminder_timezone')
    .eq('log_reminders_enabled', true)

  if (profilesError) {
    throw createError({
      statusCode: 500,
      message: profilesError.message
    })
  }

  if (!profiles?.length) {
    return [] as ReminderCandidate[]
  }

  const userIds = profiles.map((profile) => profile.user_id)

  const [{ data: subscriptions, error: subscriptionsError }, { data: entries, error: entriesError }, { data: deliveries, error: deliveriesError }] = await Promise.all([
    supabase
      .from('push_subscriptions')
      .select('id, user_id, endpoint, p256dh, auth_key')
      .in('user_id', userIds)
      .eq('enabled', true),
    supabase
      .from('symptom_entries')
      .select('user_id, occurred_at, created_at')
      .in('user_id', userIds),
    supabase
      .from('log_reminder_deliveries')
      .select('user_id, dedupe_key')
      .in('user_id', userIds)
  ])

  if (subscriptionsError || entriesError || deliveriesError) {
    throw createError({
      statusCode: 500,
      message: subscriptionsError?.message || entriesError?.message || deliveriesError?.message || 'Failed to load reminder data.'
    })
  }

  const subscriptionsByUser = groupBy(subscriptions || [], 'user_id')
  const entriesByUser = groupBy(entries || [], 'user_id')
  const deliveredKeys = new Set(
    (deliveries || []).map((delivery) => `${delivery.user_id}:${delivery.dedupe_key}`)
  )

  const candidates: ReminderCandidate[] = []

  for (const profile of profiles) {
    const userSubscriptions = subscriptionsByUser.get(profile.user_id) || []

    if (!userSubscriptions.length) {
      continue
    }

    const mappedSubscriptions = userSubscriptions.map((subscription) => ({
      id: String(subscription.id),
      endpoint: String(subscription.endpoint),
      p256dh: String(subscription.p256dh),
      auth_key: String(subscription.auth_key)
    }))

    const payloads = buildLogReminderPayloads({
      cadence: profile.logging_cadence === 'daily' ? 'daily' : 'weekly',
      weeklyLogDay: profile.weekly_log_day ?? 0,
      entries: entriesByUser.get(profile.user_id) || [],
      reminderHour: profile.reminder_hour ?? DEFAULT_LOG_REMINDER_HOUR,
      timeZone: resolveReminderTimezone(profile.reminder_timezone),
      now
    })

    for (const payload of payloads) {
      const deliveryKey = `${profile.user_id}:${payload.dedupeKey}`

      if (deliveredKeys.has(deliveryKey)) {
        continue
      }

      candidates.push({
        userId: profile.user_id,
        dedupeKey: payload.dedupeKey,
        title: payload.title,
        body: payload.body,
        subscriptions: mappedSubscriptions
      })
    }
  }

  return candidates
}

export async function deliverReminderCandidates(
  supabase: SupabaseClient,
  candidates: ReminderCandidate[]
) {
  let sentCount = 0
  let failedCount = 0
  let disabledSubscriptionCount = 0
  const results: Array<{
    userId: string
    dedupeKey: string
    delivered: boolean
    successCount: number
    failureCount: number
  }> = []

  for (const candidate of candidates) {
    let successCount = 0
    let failureCount = 0

    for (const subscription of candidate.subscriptions) {
      try {
        await sendWebPushNotification(subscription, {
          title: candidate.title,
          body: candidate.body,
          url: '/app'
        })
        successCount += 1
      } catch (error) {
        failureCount += 1

        if (isExpiredPushSubscriptionError(error)) {
          const { error: disableError } = await supabase
            .from('push_subscriptions')
            .update({
              enabled: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id)

          if (!disableError) {
            disabledSubscriptionCount += 1
          }
        }
      }
    }

    const delivered = successCount > 0

    if (delivered) {
      const { error: deliveryError } = await supabase
        .from('log_reminder_deliveries')
        .insert({
          user_id: candidate.userId,
          dedupe_key: candidate.dedupeKey
        })

      if (deliveryError && !deliveryError.message.includes('duplicate key')) {
        throw createError({
          statusCode: 500,
          message: deliveryError.message
        })
      }

      sentCount += 1
    } else if (failureCount > 0) {
      failedCount += 1
    }

    results.push({
      userId: candidate.userId,
      dedupeKey: candidate.dedupeKey,
      delivered,
      successCount,
      failureCount
    })
  }

  return {
    sentCount,
    failedCount,
    disabledSubscriptionCount,
    results
  }
}

function groupBy<T extends Record<string, unknown>>(items: T[], key: keyof T) {
  const map = new Map<string, T[]>()

  for (const item of items) {
    const groupKey = String(item[key])
    const bucket = map.get(groupKey) || []
    bucket.push(item)
    map.set(groupKey, bucket)
  }

  return map
}
