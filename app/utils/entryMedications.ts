const STORAGE_PREFIX = 'symptom-tracker-entry-medications'

function storageKey(userId?: string | null, conditionKey?: string | null) {
  const userPart = userId || 'guest'

  if (conditionKey?.trim()) {
    return `${STORAGE_PREFIX}:${userPart}:${conditionKey.trim()}`
  }

  return `${STORAGE_PREFIX}:${userPart}`
}

function splitMedicationTokens(value: string) {
  return value
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function parseMedicationList(raw: string | null) {
  if (!raw) {
    return []
  }

  try {
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

export function readSavedMedicationList(userId?: string | null, conditionKey?: string | null): string[] {
  if (!import.meta.client) {
    return []
  }

  if (conditionKey?.trim()) {
    const conditionSpecific = parseMedicationList(
      window.localStorage.getItem(storageKey(userId, conditionKey))
    )

    if (conditionSpecific.length) {
      return conditionSpecific
    }
  }

  return parseMedicationList(window.localStorage.getItem(storageKey(userId)))
}

export function writeSavedMedicationList(
  medications: string[],
  userId?: string | null,
  conditionKey?: string | null
) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(storageKey(userId, conditionKey), JSON.stringify(medications))
}

export function formatMedicationListForEntry(medications: string[]) {
  return medications.join('\n')
}

export function rememberMedicationsFromEntry(
  value: string | undefined,
  userId?: string | null,
  conditionKey?: string | null
) {
  const incoming = splitMedicationTokens(value || '')
  if (!incoming.length) {
    return readSavedMedicationList(userId, conditionKey)
  }

  const merged = [...readSavedMedicationList(userId, conditionKey)]

  incoming.forEach((medication) => {
    const exists = merged.some((item) => item.toLowerCase() === medication.toLowerCase())
    if (!exists) {
      merged.push(medication)
    }
  })

  writeSavedMedicationList(merged, userId, conditionKey)
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
