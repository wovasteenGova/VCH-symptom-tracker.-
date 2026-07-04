export type PushSubscriptionJSON = {
  endpoint?: string
  expirationTime?: number | null
  keys?: {
    p256dh?: string
    auth?: string
  }
}

/** Full-color icon in the notification body (right on Android). */
export const PUSH_NOTIFICATION_ICON = '/vch-shield-mark.png'

/** Monochrome VCH shield for Android status bar / small icon (left). */
export const PUSH_NOTIFICATION_BADGE = '/notification-badge.png'

export const PUSH_NOTIFICATION_TAG = 'vch-log-reminder'
export const PUSH_APP_NAME = 'VCH'

export function parsePushNotificationPayload(eventData: unknown) {
  if (!eventData) {
    return null
  }

  try {
    const raw = typeof eventData === 'string' ? eventData : new TextDecoder().decode(eventData as ArrayBuffer)
    const parsed = JSON.parse(raw) as { title?: string, body?: string, url?: string }

    if (!parsed.title) {
      return null
    }

    return {
      title: parsed.title,
      body: parsed.body || '',
      url: parsed.url || '/app'
    }
  } catch {
    return null
  }
}
