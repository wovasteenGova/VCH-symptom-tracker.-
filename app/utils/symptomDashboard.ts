import { resolveCatalogConditionByStoredKey } from './conditionCatalog'
import type { SymptomChartColors } from './chartTheme'
import { resolveSymptomChartColors } from './chartTheme'
import { conditionKeyFromLabel } from './subscription'

export type DashboardEntry = {
  condition_key?: string | null
  condition_label?: string | null
  severity?: number | null
  occurred_at?: string | null
  created_at?: string | null
}

export interface SeverityBucket {
  label: string
  count: number
  min: number
  max: number
}

export interface TimelinePoint {
  date: string
  timestamp: number
  severity: number
}

export interface SymptomDashboardMetrics {
  totalLogs: number
  avgSeverity: number
  maxSeverity: number
  severityBuckets: SeverityBucket[]
  timeline: TimelinePoint[]
  weeklyLogs: Array<{ label: string, count: number }>
}

const SEVERITY_BUCKETS = [
  { label: 'Mild (1–3)', min: 1, max: 3 },
  { label: 'Moderate (4–6)', min: 4, max: 6 },
  { label: 'Severe (7–10)', min: 7, max: 10 }
] as const

function parseEntryDate(entry: DashboardEntry) {
  return new Date(entry.occurred_at || entry.created_at || 0)
}

function resolveEntryConditionKey(entry: DashboardEntry) {
  const resolved = resolveCatalogConditionByStoredKey(entry.condition_key || entry.condition_label || '')
  return resolved?.key || entry.condition_key || conditionKeyFromLabel(entry.condition_label || '')
}

export function filterEntriesForCondition(
  entries: DashboardEntry[],
  conditionKeyFilter?: string | null
) {
  if (!conditionKeyFilter) {
    return entries
  }

  return entries.filter((entry) => resolveEntryConditionKey(entry) === conditionKeyFilter)
}

function roundSeverity(value: number) {
  return Math.round(value * 10) / 10
}

function formatShortDate(date: Date) {
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric' })
}

function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setHours(0, 0, 0, 0)
  copy.setDate(copy.getDate() + diff)
  return copy
}

export function buildSymptomDashboardMetrics(
  entries: DashboardEntry[],
  conditionKeyFilter?: string | null
): SymptomDashboardMetrics {
  const datedEntries = filterEntriesForCondition(entries, conditionKeyFilter)
    .filter((entry) => !Number.isNaN(parseEntryDate(entry).getTime()))

  const severityEntries = datedEntries.filter((entry) => (entry.severity ?? 0) > 0)

  if (!datedEntries.length) {
    return {
      totalLogs: 0,
      avgSeverity: 0,
      maxSeverity: 0,
      severityBuckets: SEVERITY_BUCKETS.map(bucket => ({ ...bucket, count: 0 })),
      timeline: [],
      weeklyLogs: []
    }
  }

  const severityValues = severityEntries.map(entry => entry.severity ?? 0)
  const severitySum = severityValues.reduce((sum, value) => sum + value, 0)

  const severityBuckets = SEVERITY_BUCKETS.map(bucket => ({
    ...bucket,
    count: severityEntries.filter(
      entry => (entry.severity ?? 0) >= bucket.min && (entry.severity ?? 0) <= bucket.max
    ).length
  }))

  const timeline = [...severityEntries]
    .map((entry) => {
      const date = parseEntryDate(entry)
      return {
        date: formatShortDate(date),
        timestamp: date.getTime(),
        severity: entry.severity ?? 0
      }
    })
    .sort((left, right) => left.timestamp - right.timestamp)
    .slice(-24)

  const weekMap = new Map<number, number>()
  for (const entry of datedEntries) {
    const date = parseEntryDate(entry)
    const weekStart = startOfWeek(date).getTime()
    weekMap.set(weekStart, (weekMap.get(weekStart) || 0) + 1)
  }

  const weeklyLogs = [...weekMap.entries()]
    .sort((left, right) => left[0] - right[0])
    .slice(-8)
    .map(([timestamp, count]) => ({
      label: formatShortDate(new Date(timestamp)),
      count
    }))

  return {
    totalLogs: datedEntries.length,
    avgSeverity: severityEntries.length ? roundSeverity(severitySum / severityEntries.length) : 0,
    maxSeverity: severityValues.length ? Math.max(...severityValues) : 0,
    severityBuckets,
    timeline,
    weeklyLogs
  }
}

export function buildSeverityTrendChartData(
  timeline: TimelinePoint[],
  colors: SymptomChartColors = resolveSymptomChartColors()
) {
  return {
    labels: timeline.map(point => point.date),
    datasets: [
      {
        label: 'Severity',
        data: timeline.map(point => point.severity),
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
        fill: true,
        tension: 0.32,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.primary
      }
    ]
  }
}

export function buildWeeklyLogChartData(
  weeklyLogs: Array<{ label: string, count: number }>,
  colors: SymptomChartColors = resolveSymptomChartColors()
) {
  return {
    labels: weeklyLogs.map(item => item.label),
    datasets: [
      {
        label: 'Logs',
        data: weeklyLogs.map(item => item.count),
        backgroundColor: hexToRgba(colors.primary, 0.55),
        borderRadius: 6,
        maxBarThickness: 36
      }
    ]
  }
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '').trim()
  const expanded = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized

  if (expanded.length !== 6) {
    return `rgba(14, 165, 233, ${alpha})`
  }

  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)

  if ([red, green, blue].some((value) => Number.isNaN(value))) {
    return `rgba(14, 165, 233, ${alpha})`
  }

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

export function buildSeverityMixChartData(
  buckets: SeverityBucket[],
  colors: SymptomChartColors = resolveSymptomChartColors()
) {
  return {
    labels: buckets.map(bucket => bucket.label),
    datasets: [
      {
        data: buckets.map(bucket => bucket.count),
        backgroundColor: [
          colors.mild,
          colors.moderate,
          colors.severe
        ],
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  }
}
