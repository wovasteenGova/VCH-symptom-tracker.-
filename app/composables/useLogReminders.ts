import {
  buildLogReminderPayloads,
  markReminderSent,
  readLogReminderHour,
  readLogRemindersEnabled,
  wasReminderSent,
  writeLogReminderHour,
  writeLogRemindersEnabled,
  type SymptomEntryLike
} from '../utils/logReminders'
import type { LoggingCadence } from '../utils/loggingCadence'

export function useLogReminders() {
  const remindersEnabled = useState('log-reminders-enabled', () => readLogRemindersEnabled())
  const reminderHour = useState('log-reminder-hour', () => readLogReminderHour())
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

  async function showReminderNotification(title: string, body: string) {
    if (!import.meta.client || permissionState.value !== 'granted') {
      return false
    }

    const options: NotificationOptions = {
      body,
      icon: '/pwa-192.png',
      badge: '/pwa-192.png',
      tag: 'symptom-log-reminder',
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
      reminderHour: reminderHour.value
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
    const granted = await requestReminderPermission()

    if (!granted) {
      setRemindersEnabled(false)
      return false
    }

    setRemindersEnabled(true)
    return true
  }

  onMounted(() => {
    syncPermissionState()
  })

  return {
    remindersEnabled,
    reminderHour,
    permissionState,
    requestReminderPermission,
    enableRemindersWithPermission,
    setRemindersEnabled,
    setReminderHour,
    runLogReminderCheck,
    syncPermissionState
  }
}
