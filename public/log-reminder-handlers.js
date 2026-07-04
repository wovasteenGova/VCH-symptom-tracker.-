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

  const targetUrl = resolveNotificationUrl(payload.url)

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/vch-shield-mark.png',
      badge: '/notification-badge.png',
      tag: 'vch-log-reminder',
      renotify: true,
      lang: 'en',
      dir: 'ltr',
      data: {
        url: targetUrl,
        type: 'log-reminder'
      }
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = resolveNotificationUrl(event.notification.data?.url || '/app')

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          if ('navigate' in client && typeof client.navigate === 'function') {
            return client.focus().then(() => client.navigate(targetUrl))
          }

          return client.focus()
        }
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
