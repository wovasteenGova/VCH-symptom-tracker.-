export function getVapidPublicKey() {
  const config = useRuntimeConfig()

  return String(
    config.public.vapidPublicKey
      || process.env.VAPID_PUBLIC_KEY
      || process.env.NUXT_PUBLIC_VAPID_PUBLIC_KEY
      || ''
  ).trim()
}

export function getVapidPrivateKey() {
  const config = useRuntimeConfig()

  return String(
    config.vapidPrivateKey
      || process.env.VAPID_PRIVATE_KEY
      || ''
  ).trim()
}

export function getReminderCronSecret() {
  const config = useRuntimeConfig()

  return String(
    config.reminderCronSecret
      || process.env.REMINDER_CRON_SECRET
      || process.env.NUXT_REMINDER_CRON_SECRET
      || ''
  ).trim()
}

export function isReminderTestMode() {
  const config = useRuntimeConfig()

  return config.reminderTestMode === true
    || process.env.REMINDER_TEST_MODE === 'true'
    || process.env.REMINDER_TEST_MODE === '1'
}

/** Test pushes dedupe per bucket (default 1 minute). */
export function getReminderTestIntervalMinutes() {
  const raw = Number(process.env.REMINDER_TEST_INTERVAL_MINUTES || 1)

  if (!Number.isFinite(raw) || raw < 1) {
    return 1
  }

  return Math.min(60, Math.floor(raw))
}

export function assertReminderCronAuthorized(event: { headers: Headers | { get: (name: string) => string | null } }) {
  const secret = getReminderCronSecret()

  if (!secret) {
    throw createError({
      statusCode: 503,
      message: 'Reminder cron is not configured yet (REMINDER_CRON_SECRET).'
    })
  }

  const authHeader = event.headers.get('authorization') || ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const headerSecret = event.headers.get('x-reminder-cron-secret') || bearer

  if (headerSecret !== secret) {
    throw createError({
      statusCode: 401,
      message: process.env.NODE_ENV === 'development'
        ? 'Unauthorized — REMINDER_CRON_SECRET in .env does not match Authorization Bearer (or x-reminder-cron-secret). Restart npm run dev after editing .env.'
        : 'Unauthorized'
    })
  }
}
