const deletedEntriesPrefix = 'symptom-tracker-deleted-entries'

export function getDeletedEntriesStorageKey(userId: string) {
  return `${deletedEntriesPrefix}-${userId}`
}

export function readDeletedEntriesForUser(userId: string | null | undefined) {
  if (!import.meta.client || !userId) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(getDeletedEntriesStorageKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function writeDeletedEntriesForUser(userId: string, entries: any[]) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(getDeletedEntriesStorageKey(userId), JSON.stringify(entries))
}

export function useDeletedEntryArchive() {
  function listDeletedEntries(userId: string | null | undefined) {
    return readDeletedEntriesForUser(userId)
  }

  function archiveDeletedEntry(userId: string, entry: Record<string, any>) {
    const archivedEntry = {
      ...entry,
      deleted_at: new Date().toISOString()
    }
    writeDeletedEntriesForUser(userId, [archivedEntry, ...readDeletedEntriesForUser(userId)])
    return archivedEntry
  }

  function removeDeletedEntry(userId: string, entryId: string) {
    writeDeletedEntriesForUser(
      userId,
      readDeletedEntriesForUser(userId).filter((entry) => entry.id !== entryId)
    )
  }

  function takeDeletedEntry(userId: string, entryId: string) {
    const entries = readDeletedEntriesForUser(userId)
    const entry = entries.find((item) => item.id === entryId)

    if (!entry) {
      return null
    }

    writeDeletedEntriesForUser(userId, entries.filter((item) => item.id !== entryId))
    return entry
  }

  function clearDeletedEntriesForUser(userId: string) {
    writeDeletedEntriesForUser(userId, [])
  }

  return {
    listDeletedEntries,
    archiveDeletedEntry,
    removeDeletedEntry,
    takeDeletedEntry,
    clearDeletedEntriesForUser
  }
}
