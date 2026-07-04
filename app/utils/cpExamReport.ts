type CpExamEntry = {
  condition_label: string
  severity?: number | null
  occurred_at?: string | null
  created_at?: string | null
  impact?: string | null
  summary?: string | null
  details?: Record<string, unknown> | null
}

export type CpExamConditionSummary = {
  conditionLabel: string
  entryCount: number
  trackingSpanLabel: string
  trackingWeeks: number
  overallAvgPerWeek: number
  overallFrequencyLabel: string
  recentAvgPerWeek: number
  recentFrequencyLabel: string
  avgSeverity: number
  peakSeverity: number
  severityLabel: string
  functionalImpacts: string[]
  reportedNotes: string[]
  recentWeeklyCounts: Array<{ label: string, count: number }>
}

const RECENT_WINDOW_DAYS = 90
const IMPACT_DETAIL_KEYS = [
  'had_to_stop_activity',
  'kept_you_from_sleeping',
  'movement_limit',
  'sleep_interruption'
] as const

function getEntryDate(entry: CpExamEntry) {
  return new Date(entry.occurred_at || entry.created_at || 0)
}

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime())
}

function formatFrequencyLabel(avgPerWeek: number) {
  if (avgPerWeek <= 0) {
    return 'no logged episodes in this period'
  }

  if (avgPerWeek < 0.75) {
    return 'less than once per week'
  }

  if (avgPerWeek < 1.25) {
    return 'about once per week'
  }

  const rounded = Math.round(avgPerWeek)
  const low = Math.max(1, Math.floor(avgPerWeek))
  const high = Math.ceil(avgPerWeek)

  if (high - low <= 1) {
    return `about ${rounded} times per week`
  }

  return `about ${low}–${high} times per week`
}

function formatSeverityLabel(avgSeverity: number, peakSeverity: number) {
  const avg = Math.round(avgSeverity * 10) / 10

  if (peakSeverity <= avg) {
    return `typically around ${avg}/10`
  }

  return `typically around ${avg}/10, sometimes up to ${peakSeverity}/10`
}

function parseImpactTokens(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
}

function collectFunctionalImpacts(entries: CpExamEntry[]) {
  const impactCounts = new Map<string, number>()

  for (const entry of entries) {
    for (const token of parseImpactTokens(String(entry.impact || ''))) {
      impactCounts.set(token, (impactCounts.get(token) || 0) + 1)
    }

    const details = entry.details || {}
    for (const key of IMPACT_DETAIL_KEYS) {
      const value = details[key]
      if (typeof value !== 'string' || !value.trim()) {
        continue
      }

      const label = value.trim().charAt(0).toUpperCase() + value.trim().slice(1)
      impactCounts.set(label, (impactCounts.get(label) || 0) + 1)
    }
  }

  return [...impactCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([label]) => label)
}

function buildRecentWeeklyCounts(entries: CpExamEntry[], referenceDate = new Date()) {
  const weeks: Array<{ label: string, count: number, start: Date }> = []

  for (let index = 3; index >= 0; index -= 1) {
    const end = new Date(referenceDate)
    end.setHours(23, 59, 59, 999)
    end.setDate(end.getDate() - index * 7)

    const start = new Date(end)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 6)

    const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    weeks.push({ label, count: 0, start })
  }

  for (const entry of entries) {
    const entryDate = getEntryDate(entry)
    if (!isValidDate(entryDate)) {
      continue
    }

    for (const week of weeks) {
      const weekEnd = new Date(week.start)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      if (entryDate >= week.start && entryDate <= weekEnd) {
        week.count += 1
        break
      }
    }
  }

  return weeks.map(({ label, count }) => ({ label, count }))
}

function buildTrackingSpan(entries: CpExamEntry[]) {
  const dates = entries
    .map((entry) => getEntryDate(entry))
    .filter(isValidDate)
    .sort((left, right) => left.getTime() - right.getTime())

  if (!dates.length) {
    return { trackingSpanLabel: '—', trackingWeeks: 1 }
  }

  const first = dates[0]
  const last = dates[dates.length - 1]
  const trackingDays = Math.max(1, Math.round((last.getTime() - first.getTime()) / 86_400_000) + 1)
  const trackingWeeks = Math.max(1, trackingDays / 7)

  const sameYear = first.getFullYear() === last.getFullYear()
  const firstLabel = first.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' })
  })
  const lastLabel = last.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return {
    trackingSpanLabel: `${firstLabel} – ${lastLabel}`,
    trackingWeeks
  }
}

function collectReportedNotes(entries: CpExamEntry[]) {
  const notes: string[] = []
  const seen = new Set<string>()
  const sorted = [...entries].sort((left, right) => getEntryDate(right).getTime() - getEntryDate(left).getTime())

  for (const entry of sorted) {
    for (const candidate of [entry.summary?.trim(), entry.impact?.trim()]) {
      if (!candidate) {
        continue
      }

      const key = candidate.toLowerCase()
      if (seen.has(key)) {
        continue
      }

      seen.add(key)
      notes.push(candidate)

      if (notes.length >= 5) {
        return notes
      }
    }
  }

  return notes
}

export function buildCpExamSummaries(entries: CpExamEntry[]): CpExamConditionSummary[] {
  const byCondition = new Map<string, CpExamEntry[]>()

  for (const entry of entries) {
    const label = entry.condition_label?.trim() || 'Untitled condition'
    const bucket = byCondition.get(label) || []
    bucket.push(entry)
    byCondition.set(label, bucket)
  }

  const now = new Date()
  const recentCutoff = new Date(now)
  recentCutoff.setDate(recentCutoff.getDate() - RECENT_WINDOW_DAYS)

  return [...byCondition.entries()]
    .map(([conditionLabel, conditionEntries]) => {
      const validEntries = conditionEntries.filter((entry) => isValidDate(getEntryDate(entry)))
      const recentEntries = validEntries.filter((entry) => getEntryDate(entry) >= recentCutoff)
      const { trackingSpanLabel, trackingWeeks } = buildTrackingSpan(validEntries)

      const recentWeeks = Math.max(1, RECENT_WINDOW_DAYS / 7)
      const overallAvgPerWeek = validEntries.length / trackingWeeks
      const recentAvgPerWeek = recentEntries.length / recentWeeks

      const severities = validEntries.map((entry) => entry.severity ?? 0)
      const avgSeverity = severities.reduce((sum, value) => sum + value, 0) / Math.max(severities.length, 1)
      const peakSeverity = Math.max(...severities, 0)

      const functionalImpacts = collectFunctionalImpacts(validEntries)
      const recentFrequencyLabel = formatFrequencyLabel(recentAvgPerWeek)
      const overallFrequencyLabel = formatFrequencyLabel(overallAvgPerWeek)
      const severityLabel = formatSeverityLabel(avgSeverity, peakSeverity)

      return {
        conditionLabel,
        entryCount: validEntries.length,
        trackingSpanLabel,
        trackingWeeks,
        overallAvgPerWeek,
        overallFrequencyLabel,
        recentAvgPerWeek,
        recentFrequencyLabel,
        avgSeverity,
        peakSeverity,
        severityLabel,
        functionalImpacts,
        reportedNotes: collectReportedNotes(validEntries),
        recentWeeklyCounts: buildRecentWeeklyCounts(validEntries, now),
      }
    })
    .sort((left, right) => right.entryCount - left.entryCount)
}

export function buildCpExamReportTitle(conditionLabel: string | null | undefined) {
  return conditionLabel
    ? `C&P Exam Prep — ${conditionLabel}`
    : 'C&P Exam Prep Sheet'
}
