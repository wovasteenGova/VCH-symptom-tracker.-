import type { PushSubscriptionJSON } from '../utils/pushSubscription'

export function usePushSubscriptions() {
  const supabase = useSupabaseClient()
  const trackerDb = useTrackerDb()
  const { upsertProfile } = useUserProfiles()

  async function savePushSubscription(subscription: PushSubscriptionJSON) {
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      throw new Error('Please sign in first.')
    }

    const keys = subscription.keys

    if (!subscription.endpoint || !keys?.p256dh || !keys?.auth) {
      throw new Error('Invalid push subscription.')
    }

    const { data, error } = await trackerDb
      .from('push_subscriptions')
      .upsert({
        user_id: authData.user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth_key: keys.auth,
        user_agent: import.meta.client ? navigator.userAgent : null,
        enabled: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,endpoint'
      })
      .select('id')
      .single()

    if (error) {
      throw error
    }

    if (!data?.id) {
      throw new Error('Push subscription was not saved.')
    }
  }

  async function disablePushSubscription(endpoint?: string) {
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return
    }

    let currentEndpoint = endpoint

    if (import.meta.client && !currentEndpoint && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        currentEndpoint = subscription?.endpoint
        await subscription?.unsubscribe()
      } catch {
        // Database disable still applies even if the browser subscription is already gone.
      }
    }

    let query = trackerDb
      .from('push_subscriptions')
      .update({
        enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authData.user.id)

    if (currentEndpoint) {
      query = query.eq('endpoint', currentEndpoint)
    }

    const { error } = await query

    if (error) {
      throw error
    }
  }

  async function syncProfileReminderSettings(input: {
    enabled: boolean
    reminderHour?: number
    reminderTimezone?: string
  }) {
    await upsertProfile({
      log_reminders_enabled: input.enabled,
      ...(input.reminderHour !== undefined ? { reminder_hour: input.reminderHour } : {}),
      ...(input.reminderTimezone ? { reminder_timezone: input.reminderTimezone } : {})
    })
  }

  async function hasActivePushSubscription() {
    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return false
    }

    const { count, error } = await trackerDb
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', authData.user.id)
      .eq('enabled', true)

    if (error) {
      return false
    }

    return (count || 0) > 0
  }

  async function subscribeToLogReminders(
    vapidPublicKey: string,
    settings?: {
      reminderHour?: number
      reminderTimezone?: string
    }
  ) {
    if (!import.meta.client) {
      throw new Error('Push subscriptions are only available in the browser.')
    }

    if (!vapidPublicKey) {
      throw new Error('Push is not configured yet (missing VAPID public key).')
    }

    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      throw new Error('Notifications are not supported in this browser.')
    }

    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      throw new Error('Notification permission was denied.')
    }

    const registration = await navigator.serviceWorker.ready
    await registration.update().catch(() => undefined)
    let subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await disablePushSubscription(subscription.endpoint)
      await subscription.unsubscribe().catch(() => false)
    }

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })

    await savePushSubscription(subscription.toJSON())
    await syncProfileReminderSettings({
      enabled: true,
      reminderHour: settings?.reminderHour,
      reminderTimezone: settings?.reminderTimezone
    })

    return subscription
  }

  return {
    savePushSubscription,
    disablePushSubscription,
    syncProfileReminderSettings,
    hasActivePushSubscription,
    subscribeToLogReminders
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}
