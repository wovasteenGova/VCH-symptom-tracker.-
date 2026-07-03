import type { LoggingCadence } from './loggingCadence'

export type ReportEntry = {
  occurred_at?: string | null
  created_at?: string | null
}

export type BackdateReportContext = {
  loggingCadence?: LoggingCadence
  weeklyLogDay?: number
}

export const BACKDATE_NOTE = 'Backdated entry'

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

export function isBackdatedEntry(entry: ReportEntry) {
  const createdKey = toLocalDateKey(entry.created_at)
  const occurredKey = toLocalDateKey(entry.occurred_at || entry.created_at)

  return Boolean(createdKey && occurredKey && createdKey !== occurredKey)
}

export function getEntryBackdateNote(
  entry: ReportEntry,
  _context: BackdateReportContext = {}
) {
  if (!isBackdatedEntry(entry) || !entry.created_at) {
    return null
  }

  return BACKDATE_NOTE
}

export function shouldIncludeBackfillReportNote(entries: ReportEntry[]) {
  return entries.some((entry) => isBackdatedEntry(entry))
}

/** @deprecated Global PDF banner removed — notes render per backdated entry instead. */
export function buildBackfillReportNote(_entries: ReportEntry[]) {
  return null
}
