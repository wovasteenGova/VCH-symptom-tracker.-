import { useSupabaseClient, useState } from '#imports'
import { computed, ref } from 'vue'
import { useSupabaseAuth } from './useSupabaseAuth'
import { useTrackerDb } from './useTrackerDb'
import {
  APP_WELCOME_COMPLETED_STORAGE_KEY,
  clearAppWelcomeStep,
  LOGGING_CADENCE_STORAGE_KEY,
  TERMS_ACCEPTED_AT_STORAGE_KEY,
  WEEKLY_LOG_DAY_STORAGE_KEY,
  type LoggingCadence
} from '../utils/loggingCadence'
import { getBrowserTimezone } from '../utils/logReminders'

export type AppWelcomePreferences = {
  loggingCadence: LoggingCadence
  weeklyLogDay: number
  termsAcceptedAt: string
  enableLogReminders?: boolean
  reminderHour?: number
  reminderTimezone?: string
}

function readLocalWelcomeCompleted() {
  if (!import.meta.client) {
    return false
  }

  return window.localStorage.getItem(APP_WELCOME_COMPLETED_STORAGE_KEY) === 'true'
}

function readLocalCadence(): LoggingCadence {
  if (!import.meta.client) {
    return 'weekly'
  }

  const value = window.localStorage.getItem(LOGGING_CADENCE_STORAGE_KEY)
  return value === 'daily' ? 'daily' : 'weekly'
}

function readLocalWeeklyLogDay() {
  if (!import.meta.client) {
    return 0
  }

  const parsed = Number(window.localStorage.getItem(WEEKLY_LOG_DAY_STORAGE_KEY))
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6 ? parsed : 0
}

function writeLocalPreferences(preferences: AppWelcomePreferences) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(APP_WELCOME_COMPLETED_STORAGE_KEY, 'true')
  window.localStorage.setItem(LOGGING_CADENCE_STORAGE_KEY, preferences.loggingCadence)
  window.localStorage.setItem(WEEKLY_LOG_DAY_STORAGE_KEY, String(preferences.weeklyLogDay))
  window.localStorage.setItem(TERMS_ACCEPTED_AT_STORAGE_KEY, preferences.termsAcceptedAt)
}

function isMissingReminderEveningHourError(error: unknown) {
  return Boolean(
    error
    && typeof error === 'object'
    && 'message' in error
    && String((error as { message?: unknown }).message).includes("reminder_evening_hour")
  )
}

function profileAlreadySetUp(profile: {
  terms_accepted_at?: string | null
  logging_cadence?: string | null
  conditions_onboarding_completed?: boolean | null
  tracked_condition_keys?: string[] | null
} | null | undefined) {
  if (!profile) {
    return false
  }

  return Boolean(
    profile.terms_accepted_at
    || profile.logging_cadence
    || profile.conditions_onboarding_completed
    || (profile.tracked_condition_keys?.length ?? 0) > 0
  )
}

export function useAppWelcome() {
  const supabase = useSupabaseClient()
  const trackerDb = useTrackerDb()
  const { user, isAuthLoading } = useSupabaseAuth()
  const appWelcomeCompleted = useState('tracker-app-welcome-completed', () => readLocalWelcomeCompleted())
  const loggingCadence = ref<LoggingCadence>(readLocalCadence())
  const weeklyLogDay = ref(readLocalWeeklyLogDay())
  const termsAcceptedAt = ref<string | null>(
    import.meta.client ? window.localStorage.getItem(TERMS_ACCEPTED_AT_STORAGE_KEY) : null
  )
  const isLoading = ref(false)
  const hasLoadedWelcomeState = ref(false)

  const needsAppWelcome = computed(() => {
    if (!user.value || isAuthLoading.value || isLoading.value || !hasLoadedWelcomeState.value) {
      return false
    }

    return !appWelcomeCompleted.value
  })

  async function markReturningUserWelcomeComplete(profile: {
    logging_cadence?: string | null
    weekly_log_day?: number | null
    terms_accepted_at?: string | null
  } | null | undefined) {
    const preferences: AppWelcomePreferences = {
      loggingCadence: profile?.logging_cadence === 'daily' ? 'daily' : readLocalCadence(),
      weeklyLogDay: profile?.weekly_log_day ?? readLocalWeeklyLogDay(),
      termsAcceptedAt: profile?.terms_accepted_at
        || (import.meta.client ? window.localStorage.getItem(TERMS_ACCEPTED_AT_STORAGE_KEY) : null)
        || new Date().toISOString()
    }

    writeLocalPreferences(preferences)
    clearAppWelcomeStep()
    appWelcomeCompleted.value = true
    loggingCadence.value = preferences.loggingCadence
    weeklyLogDay.value = preferences.weeklyLogDay
    termsAcceptedAt.value = preferences.termsAcceptedAt

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return
    }

    const { error } = await trackerDb
      .from('user_profiles')
      .upsert({
        user_id: userData.user.id,
        app_welcome_completed: true,
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }
  }

  async function loadAppWelcomeState() {
    isLoading.value = true
    hasLoadedWelcomeState.value = false

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        loggingCadence.value = readLocalCadence()
        weeklyLogDay.value = readLocalWeeklyLogDay()
        termsAcceptedAt.value = import.meta.client
          ? window.localStorage.getItem(TERMS_ACCEPTED_AT_STORAGE_KEY)
          : null
        return
      }

      const { data: profile, error: profileError } = await trackerDb
        .from('user_profiles')
        .select('app_welcome_completed, logging_cadence, weekly_log_day, terms_accepted_at, conditions_onboarding_completed, tracked_condition_keys')
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      if (profile?.app_welcome_completed) {
        appWelcomeCompleted.value = true
        loggingCadence.value = profile.logging_cadence === 'daily' ? 'daily' : 'weekly'
        weeklyLogDay.value = profile.weekly_log_day ?? 0
        termsAcceptedAt.value = profile.terms_accepted_at || null
        writeLocalPreferences({
          loggingCadence: loggingCadence.value,
          weeklyLogDay: weeklyLogDay.value,
          termsAcceptedAt: termsAcceptedAt.value || new Date().toISOString()
        })
        return
      }

      if (profileAlreadySetUp(profile)) {
        await markReturningUserWelcomeComplete(profile)
        return
      }

      const { count: entryCount, error: entryCountError } = await trackerDb
        .from('symptom_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userData.user.id)

      if (entryCountError) {
        throw entryCountError
      }

      if ((entryCount ?? 0) > 0) {
        await markReturningUserWelcomeComplete(profile)
        return
      }

      appWelcomeCompleted.value = false

      if (readLocalWelcomeCompleted()) {
        try {
          await completeAppWelcome({
            loggingCadence: readLocalCadence(),
            weeklyLogDay: readLocalWeeklyLogDay(),
            termsAcceptedAt: window.localStorage.getItem(TERMS_ACCEPTED_AT_STORAGE_KEY) || new Date().toISOString()
          })
        } catch (error) {
          if (!isMissingReminderEveningHourError(error)) {
            throw error
          }
        }
      }
    } finally {
      isLoading.value = false
      hasLoadedWelcomeState.value = true
    }
  }

  async function completeAppWelcome(preferences: AppWelcomePreferences) {
    writeLocalPreferences(preferences)
    clearAppWelcomeStep()
    appWelcomeCompleted.value = true
    loggingCadence.value = preferences.loggingCadence
    weeklyLogDay.value = preferences.weeklyLogDay
    termsAcceptedAt.value = preferences.termsAcceptedAt

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return
    }

    const payload = {
      user_id: userData.user.id,
      app_welcome_completed: true,
      logging_cadence: preferences.loggingCadence,
      weekly_log_day: preferences.weeklyLogDay,
      terms_accepted_at: preferences.termsAcceptedAt,
      log_reminders_enabled: preferences.enableLogReminders ?? false,
      reminder_hour: preferences.reminderHour ?? 10,
      reminder_evening_hour: 20,
      reminder_timezone: preferences.reminderTimezone ?? getBrowserTimezone(),
      updated_at: new Date().toISOString()
    }

    const { error } = await trackerDb
      .from('user_profiles')
      .upsert(payload)

    if (isMissingReminderEveningHourError(error)) {
      const { reminder_evening_hour: _reminderEveningHour, ...fallbackPayload } = payload
      const { error: fallbackError } = await trackerDb
        .from('user_profiles')
        .upsert(fallbackPayload)

      if (fallbackError) {
        throw fallbackError
      }

      return
    }

    if (error) {
      throw error
    }
  }

  async function updateLoggingCadence(cadence: LoggingCadence, nextWeeklyLogDay = weeklyLogDay.value) {
    const nextPreferences: AppWelcomePreferences = {
      loggingCadence: cadence,
      weeklyLogDay: nextWeeklyLogDay,
      termsAcceptedAt: termsAcceptedAt.value || new Date().toISOString()
    }

    loggingCadence.value = cadence
    weeklyLogDay.value = nextWeeklyLogDay

    if (import.meta.client) {
      window.localStorage.setItem(LOGGING_CADENCE_STORAGE_KEY, cadence)
      window.localStorage.setItem(WEEKLY_LOG_DAY_STORAGE_KEY, String(nextWeeklyLogDay))
    }

    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      return
    }

    const { error } = await trackerDb
      .from('user_profiles')
      .upsert({
        user_id: userData.user.id,
        logging_cadence: cadence,
        weekly_log_day: nextWeeklyLogDay,
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }
  }

  return {
    appWelcomeCompleted,
    loggingCadence,
    weeklyLogDay,
    termsAcceptedAt,
    isLoading,
    needsAppWelcome,
    loadAppWelcomeState,
    completeAppWelcome,
    updateLoggingCadence
  }
}
