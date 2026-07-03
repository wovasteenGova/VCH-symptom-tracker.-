import type { LoggingCadence } from './loggingCadence'

export type ReportEntry = {
  occurred_at?: string | null
  created_at?: string | null
}

export type BackdateReportContext = {
  loggingCadence?: LoggingCadence
  weeklyLogDay?: number
}

export const WEEKLY_CADENCE_BACKDATE_NOTE =
  'Logged on weekly review day; symptom occurred earlier that week.'

export const GENERAL_BACKDATE_NOTE =
  'Backdated entry — symptom date is earlier than the log date.'

function toLocalDateKey(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleDateString('en-CA')
}

function getWeekStartKey(date: Date) {
  const normalized = new Date(date)
  normalized.setHours(12, 0, 0, 0)
  normalized.setDate(normalized.getDate() - normalized.getDay())
  return normalized.toLocaleDateString('en-CA')
}

function isSameCalendarWeek(leftValue: string, rightValue: string) {
  const left = new Date(leftValue)
  const right = new Date(rightValue)

  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) {
    return false
  }

  return getWeekStartKey(left) === getWeekStartKey(right)
}

export function isBackdatedEntry(entry: ReportEntry) {
  const createdKey = toLocalDateKey(entry.created_at)
  const occurredKey = toLocalDateKey(entry.occurred_at || entry.created_at)

  return Boolean(createdKey && occurredKey && createdKey !== occurredKey)
}

export function getEntryBackdateNote(
  entry: ReportEntry,
  context: BackdateReportContext = {}
) {
  if (!isBackdatedEntry(entry) || !entry.created_at) {
    return null
  }

  const occurredAt = entry.occurred_at || entry.created_at
  const loggingCadence = context.loggingCadence ?? 'weekly'
  const weeklyLogDay = context.weeklyLogDay ?? 0
  const createdOnWeeklyLogDay = new Date(entry.created_at).getDay() === weeklyLogDay
  const occurredBeforeCreated = new Date(occurredAt).getTime() < new Date(entry.created_at).getTime()
  const sameWeekBackdate = isSameCalendarWeek(occurredAt, entry.created_at)

  if (
    loggingCadence === 'weekly'
    && createdOnWeeklyLogDay
    && occurredBeforeCreated
    && sameWeekBackdate
  ) {
    return WEEKLY_CADENCE_BACKDATE_NOTE
  }

  return GENERAL_BACKDATE_NOTE
}

export function shouldIncludeBackfillReportNote(entries: ReportEntry[]) {
  return entries.some((entry) => isBackdatedEntry(entry))
}

/** @deprecated Global PDF banner removed — notes render per backdated entry instead. */
export function buildBackfillReportNote(_entries: ReportEntry[]) {
  return null
}
