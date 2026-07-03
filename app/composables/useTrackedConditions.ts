import { computed, ref } from 'vue'
import { conditionKeyFromLabel } from '../utils/subscription'
import { normalizeTrackedConditionKeys, resolveCatalogConditionByStoredKey } from '../utils/conditionCatalog'
import { useSupabaseClient } from './useSupabaseClient'

const TRACKED_CONDITIONS_STORAGE_KEY = 'symptom-tracker-tracked-condition-keys'
const ONBOARDING_COMPLETED_STORAGE_KEY = 'symptom-tracker-conditions-onboarding-completed'

function readStoredKeys() {
  if (!import.meta.client) {
    return [] as string[]
  }

  try {
    const raw = window.localStorage.getItem(TRACKED_CONDITIONS_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : []
  } catch {
    return []
  }
}

function readStoredOnboardingCompleted() {
  if (!import.meta.client) {
    return false
  }

  return window.localStorage.getItem(ONBOARDING_COMPLETED_STORAGE_KEY) === 'true'
}

function writeLocalState(keys: string[], completed: boolean) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(TRACKED_CONDITIONS_STORAGE_KEY, JSON.stringify(keys))
  window.localStorage.setItem(ONBOARDING_COMPLETED_STORAGE_KEY, completed ? 'true' : 'false')
}

export function useTrackedConditions() {
  const supabase = useSupabaseClient()
  const trackedConditionKeys = ref<string[]>([])
  const onboardingCompleted = ref(false)
  const isLoading = ref(false)
  const loadError = ref('')

  const needsOnboarding = computed(() => !onboardingCompleted.value)
  const trackedConditionCount = computed(() => trackedConditionKeys.value.length)

  function applyLocalState(keys: string[], completed: boolean) {
    trackedConditionKeys.value = normalizeTrackedConditionKeys(keys)
    onboardingCompleted.value = completed
    writeLocalState(trackedConditionKeys.value, completed)
  }

  async function persistTrackedConditions(keys: string[], completed = onboardingCompleted.value) {
    const uniqueKeys = normalizeTrackedConditionKeys(keys)
    trackedConditionKeys.value = uniqueKeys
    onboardingCompleted.value = completed
    writeLocalState(uniqueKeys, completed)

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return uniqueKeys
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userData.user.id,
        tracked_condition_keys: uniqueKeys,
        conditions_onboarding_completed: completed,
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }

    return uniqueKeys
  }

  async function loadTrackedConditions(entryConditionKeys: string[] = []) {
    isLoading.value = true
    loadError.value = ''

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        const localKeys = readStoredKeys()
        const localCompleted = readStoredOnboardingCompleted()

        if (localKeys.length) {
          applyLocalState(localKeys, localCompleted)
          return
        }

        if (entryConditionKeys.length) {
          applyLocalState(entryConditionKeys.slice(0, 12), true)
          return
        }

        applyLocalState([], false)
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('tracked_condition_keys, conditions_onboarding_completed, free_condition_keys')
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (profileError) {
        throw profileError
      }

      let keys = normalizeTrackedConditionKeys([...(profile?.tracked_condition_keys || [])])
      let completed = Boolean(profile?.conditions_onboarding_completed)

      if (!keys.length && entryConditionKeys.length) {
        keys = normalizeTrackedConditionKeys(entryConditionKeys)
        completed = true
        await persistTrackedConditions(keys, completed)
        return
      }

      if (!keys.length && profile?.free_condition_keys?.length) {
        keys = normalizeTrackedConditionKeys([...profile.free_condition_keys])
        completed = keys.length > 0
        if (completed) {
          await persistTrackedConditions(keys, completed)
          return
        }
      }

      const localKeys = readStoredKeys()
      const localCompleted = readStoredOnboardingCompleted()

      if (!keys.length && localKeys.length) {
        keys = normalizeTrackedConditionKeys(localKeys)
        completed = localCompleted || localKeys.length > 0
        await persistTrackedConditions(keys, completed)
        return
      }

      trackedConditionKeys.value = keys
      onboardingCompleted.value = completed
      writeLocalState(keys, completed)

      const rawKeys = [...(profile?.tracked_condition_keys || [])].filter(Boolean)
      const needsHeal = rawKeys.some((rawKey) => {
        const resolvedKey = resolveCatalogConditionByStoredKey(rawKey)?.key
        return !resolvedKey || resolvedKey !== rawKey
      })

      if (needsHeal && keys.length) {
        await persistTrackedConditions(keys, completed)
      }
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : 'Could not load your conditions.'
      trackedConditionKeys.value = normalizeTrackedConditionKeys(readStoredKeys())
      onboardingCompleted.value = readStoredOnboardingCompleted()
    } finally {
      isLoading.value = false
    }
  }

  async function completeOnboarding(keys: string[]) {
    if (!keys.length) {
      throw new Error('Pick at least one condition to continue.')
    }

    return persistTrackedConditions(keys, true)
  }

  async function updateTrackedConditions(keys: string[]) {
    if (!keys.length) {
      throw new Error('Keep at least one condition on your home screen.')
    }

    return persistTrackedConditions(keys, true)
  }

  function conditionKeyForLabel(label: string) {
    return conditionKeyFromLabel(label)
  }

  return {
    trackedConditionKeys,
    onboardingCompleted,
    needsOnboarding,
    trackedConditionCount,
    isLoading,
    loadError,
    loadTrackedConditions,
    completeOnboarding,
    updateTrackedConditions,
    conditionKeyForLabel
  }
}
