export type EntryDraftCondition = {
  title: string
  category: string
  description: string
  image: string
}

export type EntryDraftSnapshot = {
  version: 1
  savedAt: string
  entryStep: number
  severityValue: number
  entryForm: Record<string, string>
  selectedSearchCondition: EntryDraftCondition | null
  customConditionInput: string
  conditionTitle: string
}

export function getEntryDraftStorageKey(userId: string | null | undefined) {
  return userId
    ? `symptom-tracker-entry-draft:${userId}`
    : 'symptom-tracker-entry-draft:guest'
}

export function readEntryDraft(userId: string | null | undefined): EntryDraftSnapshot | null {
  if (!import.meta.client) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(getEntryDraftStorageKey(userId))

    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as EntryDraftSnapshot

    if (parsed?.version !== 1) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function writeEntryDraft(userId: string | null | undefined, snapshot: EntryDraftSnapshot) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(getEntryDraftStorageKey(userId), JSON.stringify(snapshot))
}

export function clearEntryDraft(userId: string | null | undefined) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.removeItem(getEntryDraftStorageKey(userId))
}

export function isMeaningfulEntryDraft(snapshot: {
  entryStep?: number
  entryForm?: Record<string, string>
  selectedSearchCondition?: EntryDraftCondition | null
  customConditionInput?: string
}) {
  if (snapshot.selectedSearchCondition) {
    return true
  }

  if (snapshot.customConditionInput?.trim()) {
    return true
  }

  if (snapshot.entryForm?.condition_name?.trim()) {
    return true
  }

  if ((snapshot.entryStep ?? 0) > 0) {
    return true
  }

  const form = snapshot.entryForm || {}

  for (const [key, value] of Object.entries(form)) {
    if (key === 'date_and_time') {
      continue
    }

    if (value?.trim()) {
      return true
    }
  }

  return false
}

export function buildEntryDraftSnapshot(input: {
  entryStep: number
  severityValue: number
  entryForm: Record<string, string>
  selectedSearchCondition: EntryDraftCondition | null
  customConditionInput: string
  conditionTitle: string
}): EntryDraftSnapshot | null {
  const snapshot: EntryDraftSnapshot = {
    version: 1,
    savedAt: new Date().toISOString(),
    entryStep: input.entryStep,
    severityValue: input.severityValue,
    entryForm: { ...input.entryForm },
    selectedSearchCondition: input.selectedSearchCondition
      ? { ...input.selectedSearchCondition }
      : null,
    customConditionInput: input.customConditionInput,
    conditionTitle: input.conditionTitle
  }

  return isMeaningfulEntryDraft(snapshot) ? snapshot : null
}

export function formatEntryDraftTimeLabel(savedAt: string) {
  const savedDate = new Date(savedAt)

  if (Number.isNaN(savedDate.getTime())) {
    return 'Saved recently'
  }

  return savedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
