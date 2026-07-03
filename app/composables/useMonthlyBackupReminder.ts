import { ref, watch } from 'vue'
import {
  markMonthlyBackupReminderSeen,
  shouldShowMonthlyBackupReminder
} from '../utils/monthlyBackupReminder'

export function useMonthlyBackupReminder(userId: () => string | undefined, hasEntries: () => boolean) {
  const isMonthlyBackupReminderVisible = ref(false)

  function refreshMonthlyBackupReminder() {
    const id = userId()
    isMonthlyBackupReminderVisible.value = shouldShowMonthlyBackupReminder(id || '', hasEntries())
  }

  function dismissMonthlyBackupReminder() {
    const id = userId()
    if (!id) {
      isMonthlyBackupReminderVisible.value = false
      return
    }

    markMonthlyBackupReminderSeen(id)
    isMonthlyBackupReminderVisible.value = false
  }

  watch(
    () => [userId(), hasEntries()] as const,
    () => {
      refreshMonthlyBackupReminder()
    },
    { immediate: true }
  )

  return {
    isMonthlyBackupReminderVisible,
    refreshMonthlyBackupReminder,
    dismissMonthlyBackupReminder
  }
}
