import { requireAuthUser } from '../../utils/authUser'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import {
  LOG_REMINDER_TEST_BODY,
  LOG_REMINDER_TEST_MODE,
  LOG_REMINDER_TEST_TITLE
} from '../../../app/utils/logReminders'
import {
  assertWebPushConfigured,
  isExpiredPushSubscriptionError,
  sendWebPushNotification
} from '../../utils/webPush'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthUser(event)
  assertWebPushConfigured()

  const supabase = getSupabaseAdmin()
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth_key')
    .eq('user_id', user.id)
    .eq('enabled', true)

  if (error) {
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }

  if (!subscriptions?.length) {
    throw createError({
      statusCode: 404,
      message: 'No enabled push subscription found for this account. Enable log reminders on this device first.'
    })
  }

  let successCount = 0
  let failureCount = 0
  let disabledSubscriptionCount = 0

  for (const subscription of subscriptions) {
    try {
      await sendWebPushNotification(
        {
          id: String(subscription.id),
          endpoint: String(subscription.endpoint),
          p256dh: String(subscription.p256dh),
          auth_key: String(subscription.auth_key)
        },
        {
          title: LOG_REMINDER_TEST_MODE ? LOG_REMINDER_TEST_TITLE : 'VCH — Test notification',
          body: LOG_REMINDER_TEST_MODE
            ? LOG_REMINDER_TEST_BODY
            : 'If you can read this, background log reminders can reach this device.',
          url: '/app'
        }
      )
      successCount += 1
    } catch (pushError) {
      failureCount += 1

      if (isExpiredPushSubscriptionError(pushError)) {
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

  if (successCount === 0) {
    throw createError({
      statusCode: 502,
      message: disabledSubscriptionCount > 0
        ? 'Your push subscription expired. Turn reminders Off, then Enable again on this device.'
        : 'Push delivery failed. Try Enable again, or reinstall the app.'
    })
  }

  return {
    ok: true,
    successCount,
    failureCount,
    disabledSubscriptionCount
  }
})
