const STORAGE_PREFIX = 'symptom-tracker-entry-medications'

function storageKey(userId?: string | null) {
  return userId ? `${STORAGE_PREFIX}:${userId}` : `${STORAGE_PREFIX}:guest`
}

function splitMedicationTokens(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

export function readSavedMedicationList(userId?: string | null): string[] {
  if (!import.meta.client) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(storageKey(userId))
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
  } catch {
    return []
  }
}

export function writeSavedMedicationList(medications: string[], userId?: string | null) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(storageKey(userId), JSON.stringify(medications))
}

export function formatMedicationListForEntry(medications: string[]) {
  return medications.join('\n')
}

export function rememberMedicationsFromEntry(value: string | undefined, userId?: string | null) {
  const incoming = splitMedicationTokens(value || '')
  if (!incoming.length) {
    return readSavedMedicationList(userId)
  }

  const merged = [...readSavedMedicationList(userId)]

  incoming.forEach((medication) => {
    const exists = merged.some((item) => item.toLowerCase() === medication.toLowerCase())
    if (!exists) {
      merged.push(medication)
    }
  })

  writeSavedMedicationList(merged, userId)
  return merged
}

export function collectMedicationsFromEntries(
  entries: Array<{ details?: Record<string, unknown> | null, updated_at?: string | null, created_at?: string | null }>
) {
  const frequency = new Map<string, { label: string, count: number, latestAt: number }>()

  entries.forEach((entry) => {
    const raw = entry.details?.medications_for_this_entry
    if (typeof raw !== 'string' || !raw.trim()) {
      return
    }

    const timestamp = new Date(entry.updated_at || entry.created_at || 0).getTime()
    splitMedicationTokens(raw).forEach((medication) => {
      const key = medication.toLowerCase()
      const existing = frequency.get(key)

      if (!existing) {
        frequency.set(key, { label: medication, count: 1, latestAt: timestamp })
        return
      }

      existing.count += 1
      if (timestamp >= existing.latestAt) {
        existing.latestAt = timestamp
        existing.label = medication
      }
    })
  })

  return [...frequency.values()]
    .sort((left, right) => right.latestAt - left.latestAt || right.count - left.count || left.label.localeCompare(right.label))
    .map((item) => item.label)
}
