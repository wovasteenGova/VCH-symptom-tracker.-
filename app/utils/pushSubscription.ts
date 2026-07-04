export type PushSubscriptionJSON = {
  endpoint?: string
  expirationTime?: number | null
  keys?: {
    p256dh?: string
    auth?: string
  }
}

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
