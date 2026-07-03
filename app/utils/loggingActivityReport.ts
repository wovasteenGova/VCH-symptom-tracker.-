type LoggingEntry = {
  condition_label: string
  occurred_at?: string | null
  created_at?: string | null
}

export type LoggingActivityMetrics = {
  monthLabel: string
  year: number
  month: number
  totalLogs: number
  conditionCount: number
  conditionBreakdown: Array<{ label: string, count: number }>
  extraConditionCount: number
  weeklyBreakdown: Array<{ label: string, count: number }>
  dailyCounts: number[]
  mondayOffset: number
}

const MAX_VISIBLE_CONDITIONS = 5

function getEntryDate(entry: LoggingEntry) {
  return new Date(entry.occurred_at || entry.created_at || 0)
}

function isValidEntryDate(date: Date) {
  return !Number.isNaN(date.getTime())
}

function filterEntriesForMonth(entries: LoggingEntry[], year: number, month: number) {
  return entries.filter((entry) => {
    const entryDate = getEntryDate(entry)
    if (!isValidEntryDate(entryDate)) {
      return false
    }

    return entryDate.getFullYear() === year && entryDate.getMonth() === month
  })
}

function buildWeeklyBreakdown(monthEntries: LoggingEntry[], year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weekCount = Math.ceil(daysInMonth / 7)

  return Array.from({ length: weekCount }, (_, index) => {
    const startDay = index * 7 + 1
    const endDay = Math.min(startDay + 6, daysInMonth)
    const count = monthEntries.filter((entry) => {
      const day = getEntryDate(entry).getDate()
      return day >= startDay && day <= endDay
    }).length

    return {
      label: `Week ${index + 1} (${startDay}-${endDay})`,
      count
    }
  })
}

export function buildLoggingActivityMetrics(
  entries: LoggingEntry[],
  year: number,
  month: number
): LoggingActivityMetrics {
  const monthEntries = filterEntriesForMonth(entries, year, month)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1

  const byCondition = new Map<string, number>()
  monthEntries.forEach((entry) => {
    const label = entry.condition_label?.trim() || 'Untitled condition'
    byCondition.set(label, (byCondition.get(label) || 0) + 1)
  })

  const sortedConditions = [...byCondition.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([label, count]) => ({ label, count }))

  const dailyCounts = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    return monthEntries.filter((entry) => getEntryDate(entry).getDate() === day).length
  })

  return {
    monthLabel: new Date(year, month, 1).toLocaleString('en-US', {
      month: 'long',
      year: 'numeric'
    }),
    year,
    month,
    totalLogs: monthEntries.length,
    conditionCount: byCondition.size,
    conditionBreakdown: sortedConditions.slice(0, MAX_VISIBLE_CONDITIONS),
    extraConditionCount: Math.max(0, sortedConditions.length - MAX_VISIBLE_CONDITIONS),
    weeklyBreakdown: buildWeeklyBreakdown(monthEntries, year, month),
    dailyCounts,
    mondayOffset
  }
}

export function formatLoggingActivitySummary(metrics: LoggingActivityMetrics) {
  const logLabel = metrics.totalLogs === 1 ? 'symptom log' : 'symptom logs'
  const conditionLabel = metrics.conditionCount === 1 ? 'condition' : 'conditions'

  if (!metrics.totalLogs) {
    return `No symptom logs recorded in ${metrics.monthLabel}.`
  }

  return `${metrics.totalLogs} ${logLabel} this month · ${metrics.conditionCount} ${conditionLabel} tracked`
}
