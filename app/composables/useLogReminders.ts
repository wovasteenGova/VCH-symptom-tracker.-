import {
  buildLogReminderPayloads,
  defaultLogReminderSettings,
  getBrowserTimezone,
  markReminderSent,
  readLogReminderHour,
  readLogReminderTimezone,
  readLogRemindersEnabled,
  resolveReminderTimezone,
  wasReminderSent,
  writeLogReminderHour,
  writeLogRemindersEnabled,
  writeLogReminderTimezone,
  type SymptomEntryLike
} from '../utils/logReminders'
import {
  PUSH_NOTIFICATION_BADGE,
  PUSH_NOTIFICATION_ICON,
  PUSH_NOTIFICATION_TAG
} from '../utils/pushSubscription'
import type { LoggingCadence } from '../utils/loggingCadence'

export function useLogReminders() {
  const config = useRuntimeConfig()
  const {
    subscribeToLogReminders,
    disablePushSubscription,
    syncProfileReminderSettings
  } = usePushSubscriptions()
  const remindersEnabled = useState('log-reminders-enabled', () => readLogRemindersEnabled())
  const reminderHour = useState('log-reminder-hour', () => readLogReminderHour())
  const reminderTimezone = useState('log-reminder-timezone', () => readLogReminderTimezone())
  const permissionState = ref<NotificationPermission | 'unsupported'>('default')

  function syncPermissionState() {
    if (!import.meta.client || typeof Notification === 'undefined') {
      permissionState.value = 'unsupported'
      return
    }

    permissionState.value = Notification.permission
  }

  async function requestReminderPermission() {
    if (!import.meta.client || typeof Notification === 'undefined') {
      permissionState.value = 'unsupported'
      return false
    }

    const result = await Notification.requestPermission()
    permissionState.value = result
    return result === 'granted'
  }

  function setRemindersEnabled(enabled: boolean) {
    remindersEnabled.value = enabled
    writeLogRemindersEnabled(enabled)
  }

  function setReminderHour(hour: number) {
    reminderHour.value = hour
    writeLogReminderHour(hour)
  }

  function setReminderTimezone(timeZone: string) {
    const resolved = resolveReminderTimezone(timeZone)
    reminderTimezone.value = resolved
    writeLogReminderTimezone(resolved)
  }

  function hydrateReminderSettings(input?: {
    log_reminders_enabled?: boolean | null
    reminder_hour?: number | null
    reminder_timezone?: string | null
  } | null) {
    const defaults = defaultLogReminderSettings()

    if (input?.reminder_hour != null && Number.isFinite(input.reminder_hour)) {
      setReminderHour(Number(input.reminder_hour))
    } else {
      setReminderHour(defaults.hour)
    }

    setReminderTimezone(input?.reminder_timezone || getBrowserTimezone())

    if (input?.log_reminders_enabled) {
      setRemindersEnabled(true)
    }
  }

  async function persistReminderSettings(input?: {
    enabled?: boolean
    hour?: number
    timezone?: string
  }) {
    const enabled = input?.enabled ?? remindersEnabled.value
    const hour = input?.hour ?? reminderHour.value
    const timezone = resolveReminderTimezone(input?.timezone ?? reminderTimezone.value)

    setRemindersEnabled(enabled)
    setReminderHour(hour)
    setReminderTimezone(timezone)

    await syncProfileReminderSettings({
      enabled,
      reminderHour: hour,
      reminderTimezone: timezone
    })
  }

  async function showReminderNotification(title: string, body: string) {
    if (!import.meta.client || permissionState.value !== 'granted') {
      return false
    }

    const options: NotificationOptions = {
      body,
      icon: PUSH_NOTIFICATION_ICON,
      badge: PUSH_NOTIFICATION_BADGE,
      tag: PUSH_NOTIFICATION_TAG,
      data: { url: '/app' }
    }

    try {
      const registration = await navigator.serviceWorker?.ready

      if (registration?.showNotification) {
        await registration.showNotification(title, options)
        return true
      }

      new Notification(title, options)
      return true
    } catch {
      return false
    }
  }

  async function runLogReminderCheck(input: {
    cadence: LoggingCadence
    weeklyLogDay: number
    entries: SymptomEntryLike[]
    isAuthenticated: boolean
  }) {
    if (!import.meta.client || !input.isAuthenticated || !remindersEnabled.value) {
      return
    }

    syncPermissionState()

    if (permissionState.value !== 'granted') {
      return
    }

    const payloads = buildLogReminderPayloads({
      cadence: input.cadence,
      weeklyLogDay: input.weeklyLogDay,
      entries: input.entries,
      reminderHour: reminderHour.value,
      timeZone: reminderTimezone.value
    })

    for (const payload of payloads) {
      if (wasReminderSent(payload.dedupeKey)) {
        continue
      }

      const shown = await showReminderNotification(payload.title, payload.body)

      if (shown) {
        markReminderSent(payload.dedupeKey)
      }
    }
  }

  async function enableRemindersWithPermission() {
    const publicKey = String(config.public.vapidPublicKey || '').trim()
    const timezone = getBrowserTimezone()

    setReminderTimezone(timezone)

    if (!reminderHour.value) {
      setReminderHour(defaultLogReminderSettings().hour)
    }

    try {
      if (publicKey) {
        await subscribeToLogReminders(publicKey, {
          reminderHour: reminderHour.value,
          reminderTimezone: timezone
        })
      } else {
        const granted = await requestReminderPermission()

        if (!granted) {
          setRemindersEnabled(false)
          return false
        }

        await syncProfileReminderSettings({
          enabled: true,
          reminderHour: reminderHour.value,
          reminderTimezone: timezone
        })
      }

      setRemindersEnabled(true)
      return true
    } catch {
      setRemindersEnabled(false)
      return false
    }
  }

  async function disableReminders() {
    setRemindersEnabled(false)

    try {
      await disablePushSubscription()
      await syncProfileReminderSettings({
        enabled: false,
        reminderHour: reminderHour.value,
        reminderTimezone: reminderTimezone.value
      })
    } catch {
      // Local disable still applies even if Supabase sync fails.
    }
  }

  async function updateReminderHour(hour: number) {
    setReminderHour(hour)

    await syncProfileReminderSettings({
      enabled: remindersEnabled.value,
      reminderHour: hour,
      reminderTimezone: reminderTimezone.value
    })
  }

  onMounted(() => {
    syncPermissionState()

    if (import.meta.client && !window.localStorage.getItem('symptom-tracker-log-reminder-timezone')) {
      setReminderTimezone(getBrowserTimezone())
    }
  })

  return {
    remindersEnabled,
    reminderHour,
    reminderTimezone,
    permissionState,
    requestReminderPermission,
    enableRemindersWithPermission,
    disableReminders,
    setRemindersEnabled,
    setReminderHour,
    setReminderTimezone,
    hydrateReminderSettings,
    persistReminderSettings,
    updateReminderHour,
    runLogReminderCheck,
    syncPermissionState
  }
}
