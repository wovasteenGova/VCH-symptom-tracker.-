type ReportEntry = {
  occurred_at?: string | null
  created_at?: string | null
}

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

export function shouldIncludeBackfillReportNote(entries: ReportEntry[]) {
  if (entries.length < 2) {
    return entries.some((entry) => {
      const createdKey = toLocalDateKey(entry.created_at)
      const occurredKey = toLocalDateKey(entry.occurred_at || entry.created_at)
      return Boolean(createdKey && occurredKey && createdKey !== occurredKey)
    })
  }

  const occurredDatesByCreatedDay = new Map<string, Set<string>>()
  let hasBackdatedEntry = false

  for (const entry of entries) {
    const createdKey = toLocalDateKey(entry.created_at)
    const occurredKey = toLocalDateKey(entry.occurred_at || entry.created_at)

    if (!createdKey || !occurredKey) {
      continue
    }

    if (createdKey !== occurredKey) {
      hasBackdatedEntry = true
    }

    if (!occurredDatesByCreatedDay.has(createdKey)) {
      occurredDatesByCreatedDay.set(createdKey, new Set())
    }

    occurredDatesByCreatedDay.get(createdKey)!.add(occurredKey)
  }

  const hasSameDayBatchTransfer = [...occurredDatesByCreatedDay.values()].some((dates) => dates.size >= 2)

  return hasBackdatedEntry || hasSameDayBatchTransfer
}

export function buildBackfillReportNote(entries: ReportEntry[]) {
  if (!shouldIncludeBackfillReportNote(entries)) {
    return null
  }

  const createdDays = [...new Set(entries.map((entry) => toLocalDateKey(entry.created_at)).filter(Boolean))] as string[]
  const formattedCreatedDays = createdDays
    .slice(0, 3)
    .map((day) => new Date(`${day}T12:00:00`).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }))

  const createdDayText = formattedCreatedDays.length === 1
    ? formattedCreatedDays[0]
    : `${formattedCreatedDays.slice(0, -1).join(', ')} and ${formattedCreatedDays.at(-1)}`

  return [
    'Note to rater: Some entries in this report describe symptoms or events that occurred on earlier dates.',
    `The veteran entered or transferred these records on ${createdDayText} while moving prior notes into this tracker.`,
    'Each entry shows the date the symptom or event occurred — not necessarily the date it was logged in the app.'
  ].join(' ')
}
