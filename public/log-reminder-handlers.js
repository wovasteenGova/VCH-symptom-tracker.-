const PUSH_ICON = '/pwa-192.png'
const PUSH_BADGE = '/notification-badge.png'
const PUSH_TAG = 'vch-log-reminder'

self.addEventListener('push', (event) => {
  let payload = {
    title: 'VCH — Log reminder',
    body: 'Open the app to add your symptom entry.',
    url: '/app'
  }

  try {
    if (event.data) {
      const parsed = event.data.json()
      payload = {
        title: parsed.title || payload.title,
        body: parsed.body || payload.body,
        url: parsed.url || payload.url
      }
    }
  } catch {
    // Keep default payload.
  }

  event.waitUntil(showPushNotification(payload))
})

async function showPushNotification(payload) {
  const title = String(payload.title || 'VCH — Log reminder').trim() || 'VCH — Log reminder'
  const body = String(payload.body || 'Open the app to add your symptom entry.').trim()
    || 'Open the app to add your symptom entry.'
  const targetUrl = resolveNotificationUrl(payload.url)
  const baseOptions = {
    body,
    tag: PUSH_TAG,
    renotify: true,
    lang: 'en',
    dir: 'ltr',
    vibrate: [120, 60, 120],
    data: {
      url: targetUrl,
      type: 'log-reminder'
    }
  }

  const attempts = [
    { ...baseOptions, icon: PUSH_ICON, badge: PUSH_BADGE },
    { ...baseOptions, icon: PUSH_ICON },
    baseOptions,
    { body, data: { url: targetUrl, type: 'log-reminder' } }
  ]

  for (const options of attempts) {
    try {
      await self.registration.showNotification(title, options)
      return
    } catch (error) {
      console.warn('[vch-push] showNotification failed', error)
    }
  }

  // Last resort: Chrome requires a visible notification for userVisibleOnly pushes.
  // If every attempt fails, still try the absolute minimum so the OS does not
  // substitute a generic/default notification.
  try {
    await self.registration.showNotification(title, { body })
  } catch (error) {
    console.error('[vch-push] all showNotification attempts failed', error)
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = resolveNotificationUrl(event.notification.data?.url || '/app')

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (!('focus' in client)) {
          continue
        }

        if ('navigate' in client && typeof client.navigate === 'function') {
          return client.focus().then(() => client.navigate(targetUrl)).catch(() => client.focus())
        }

        return client.focus()
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

function resolveNotificationUrl(url) {
  const path = String(url || '/app').trim() || '/app'

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }

  return `${self.location.origin}${path.startsWith('/') ? path : `/${path}`}`
}
