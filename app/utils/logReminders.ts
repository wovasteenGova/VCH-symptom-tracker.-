import type { LoggingCadence } from './loggingCadence'
import { getWeeklyLogDayLabel } from './loggingCadence'

export const LOG_REMINDERS_ENABLED_KEY = 'symptom-tracker-log-reminders-enabled'
export const LOG_REMINDER_HOUR_KEY = 'symptom-tracker-log-reminder-hour'
export const LOG_REMINDER_SENT_PREFIX = 'symptom-tracker-log-reminder-sent:'

export type LogReminderKind =
  | 'daily'
  | 'weekly-eve'
  | 'weekly-day'
  | 'weekly-followup'

export type LogReminderPayload = {
  kind: LogReminderKind
  title: string
  body: string
  dedupeKey: string
}

export type SymptomEntryLike = {
  occurred_at?: string | null
  created_at?: string | null
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function readLogRemindersEnabled() {
  if (!import.meta.client) {
    return false
  }

  return window.localStorage.getItem(LOG_REMINDERS_ENABLED_KEY) === '1'
}

export function writeLogRemindersEnabled(enabled: boolean) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(LOG_REMINDERS_ENABLED_KEY, enabled ? '1' : '0')
}

export function readLogReminderHour() {
  if (!import.meta.client) {
    return 9
  }

  const parsed = Number(window.localStorage.getItem(LOG_REMINDER_HOUR_KEY))

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 23) {
    return 9
  }

  return parsed
}

export function writeLogReminderHour(hour: number) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(LOG_REMINDER_HOUR_KEY, String(Math.min(23, Math.max(0, hour))))
}

export function wasReminderSent(dedupeKey: string) {
  if (!import.meta.client) {
    return false
  }

  return window.localStorage.getItem(`${LOG_REMINDER_SENT_PREFIX}${dedupeKey}`) === '1'
}

export function markReminderSent(dedupeKey: string) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(`${LOG_REMINDER_SENT_PREFIX}${dedupeKey}`, '1')
}

function entryTimestamp(entry: SymptomEntryLike) {
  const raw = entry.occurred_at || entry.created_at

  if (!raw) {
    return null
  }

  const parsed = new Date(raw)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function hasLoggedToday(entries: SymptomEntryLike[], now = new Date()) {
  const todayKey = getLocalDateKey(now)

  return entries.some((entry) => {
    const timestamp = entryTimestamp(entry)

    if (!timestamp) {
      return false
    }

    return getLocalDateKey(timestamp) === todayKey
  })
}

export function getCurrentLogWeekStart(weeklyLogDay: number, now = new Date()) {
  const start = new Date(now)
  const diff = (start.getDay() - weeklyLogDay + 7) % 7

  start.setDate(start.getDate() - diff)
  start.setHours(0, 0, 0, 0)

  return start
}

export function hasLoggedThisLogWeek(
  entries: SymptomEntryLike[],
  weeklyLogDay: number,
  now = new Date()
) {
  const weekStart = getCurrentLogWeekStart(weeklyLogDay, now)

  return entries.some((entry) => {
    const timestamp = entryTimestamp(entry)

    if (!timestamp) {
      return false
    }

    return timestamp >= weekStart
  })
}

export function isReminderHourReached(reminderHour: number, now = new Date()) {
  return now.getHours() >= reminderHour
}

export function buildLogReminderPayloads(input: {
  cadence: LoggingCadence
  weeklyLogDay: number
  entries: SymptomEntryLike[]
  reminderHour?: number
  now?: Date
}): LogReminderPayload[] {
  const now = input.now ?? new Date()
  const reminderHour = input.reminderHour ?? readLogReminderHour()
  const payloads: LogReminderPayload[] = []
  const dateKey = getLocalDateKey(now)

  if (!isReminderHourReached(reminderHour, now)) {
    return payloads
  }

  if (input.cadence === 'daily') {
    if (hasLoggedToday(input.entries, now)) {
      return payloads
    }

    payloads.push({
      kind: 'daily',
      title: 'Time to log symptoms',
      body: 'Add a quick entry while today is still fresh.',
      dedupeKey: `daily:${dateKey}`
    })

    return payloads
  }

  const logDayLabel = getWeeklyLogDayLabel(input.weeklyLogDay)
  const today = now.getDay()
  const dayBefore = (input.weeklyLogDay + 6) % 7
  const dayAfter = (input.weeklyLogDay + 1) % 7
  const loggedThisWeek = hasLoggedThisLogWeek(input.entries, input.weeklyLogDay, now)

  if (today === dayBefore) {
    payloads.push({
      kind: 'weekly-eve',
      title: `Log day is tomorrow`,
      body: `You chose ${logDayLabel}s for weekly logging. Plan a few minutes tomorrow to capture the week.`,
      dedupeKey: `weekly-eve:${dateKey}`
    })
  }

  if (today === input.weeklyLogDay && !loggedThisWeek) {
    payloads.push({
      kind: 'weekly-day',
      title: `Today is your log day`,
      body: `It is ${logDayLabel}. Log once and capture the week together.`,
      dedupeKey: `weekly-day:${dateKey}`
    })
  }

  if (today === dayAfter && !loggedThisWeek) {
    payloads.push({
      kind: 'weekly-followup',
      title: 'Catch up on your weekly log',
      body: `You planned to log on ${logDayLabel}. Add an entry when you can while the week is still fresh.`,
      dedupeKey: `weekly-followup:${dateKey}`
    })
  }

  return payloads
}

export function describeLogReminderSchedule(cadence: LoggingCadence, weeklyLogDay: number) {
  if (cadence === 'daily') {
    return 'A reminder each day after 9 AM if you have not logged yet.'
  }

  const logDayLabel = getWeeklyLogDayLabel(weeklyLogDay)

  return `Reminders the day before ${logDayLabel}, on ${logDayLabel}, and the day after if you still have not logged.`
}
