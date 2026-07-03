import { computed, ref } from 'vue'
import {
  FREE_CONDITION_LIMIT,
  PRO_PRODUCT_KEY,
  isActiveEntitlementStatus
} from '../utils/subscription'
import { useSupabaseClient } from './useSupabaseClient'

type EntitlementRow = {
  user_id: string
  product_key: string
  status: string
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  current_period_end?: string | null
  granted_by?: string | null
  grant_note?: string | null
  unlocked_at?: string | null
}

export function useEntitlements() {
  const supabase = useSupabaseClient()
  const entitlement = ref<EntitlementRow | null>(null)
  const freeConditionKeys = ref<string[]>([])
  const isLoading = ref(false)
  const loadError = ref('')

  const isPro = computed(() => isActiveEntitlementStatus(entitlement.value?.status))
  const isComped = computed(() => entitlement.value?.status === 'comped')
  const canUseCharts = computed(() => isPro.value)
  const canUseFamilyReporting = computed(() => isPro.value)
  const canExportPdf = computed(() => isPro.value)
  const freeConditionSlotsRemaining = computed(() => {
    return Math.max(0, FREE_CONDITION_LIMIT - freeConditionKeys.value.length)
  })
  const renewalLabel = computed(() => {
    if (!entitlement.value?.current_period_end || !isPro.value || isComped.value) {
      return ''
    }

    return new Date(entitlement.value.current_period_end).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  })

  async function getAccessToken() {
    const { data, error } = await supabase.auth.getSession()

    if (error || !data.session?.access_token) {
      throw new Error('Sign in to continue.')
    }

    return data.session.access_token
  }

  async function persistFreeConditionKeys(userId: string, keys: string[]) {
    const uniqueKeys = [...new Set(keys.filter(Boolean))].slice(0, FREE_CONDITION_LIMIT)

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        free_condition_keys: uniqueKeys,
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }

    freeConditionKeys.value = uniqueKeys
    return uniqueKeys
  }

  async function loadEntitlements() {
    isLoading.value = true
    loadError.value = ''

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        entitlement.value = null
        freeConditionKeys.value = []
        return
      }

      const userId = userData.user.id

      const [
        { data: entitlementData, error: entitlementError },
        { data: profile, error: profileError },
        { data: entries, error: entriesError }
      ] = await Promise.all([
        supabase
          .from('user_entitlements')
          .select('user_id, product_key, status, stripe_customer_id, stripe_subscription_id, current_period_end, granted_by, grant_note, unlocked_at')
          .eq('user_id', userId)
          .eq('product_key', PRO_PRODUCT_KEY)
          .maybeSingle(),
        supabase
          .from('user_profiles')
          .select('free_condition_keys')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('symptom_entries')
          .select('condition_key, created_at')
          .eq('user_id', userId)
          .eq('source', 'veteran')
          .order('created_at', { ascending: true })
      ])

      if (entitlementError) {
        throw entitlementError
      }

      if (profileError) {
        throw profileError
      }

      if (entriesError) {
        throw entriesError
      }

      entitlement.value = entitlementData

      let selectedKeys = [...(profile?.free_condition_keys || [])].filter(Boolean)

      if (!selectedKeys.length && entries?.length) {
        selectedKeys = [...new Set(entries.map((entry) => entry.condition_key).filter(Boolean))].slice(0, FREE_CONDITION_LIMIT)
        if (selectedKeys.length) {
          await persistFreeConditionKeys(userId, selectedKeys)
        }
      } else {
        freeConditionKeys.value = selectedKeys.slice(0, FREE_CONDITION_LIMIT)
      }
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : 'Could not load plan details.'
    } finally {
      isLoading.value = false
    }
  }

  function canTrackCondition(conditionKey: string) {
    if (!conditionKey || isPro.value) {
      return true
    }

    return freeConditionKeys.value.includes(conditionKey)
  }

  function canAddFreeCondition(conditionKey: string) {
    if (!conditionKey || isPro.value) {
      return true
    }

    if (freeConditionKeys.value.includes(conditionKey)) {
      return true
    }

    return freeConditionKeys.value.length < FREE_CONDITION_LIMIT
  }

  async function addFreeCondition(conditionKey: string) {
    if (!conditionKey || isPro.value || freeConditionKeys.value.includes(conditionKey)) {
      return freeConditionKeys.value
    }

    if (freeConditionKeys.value.length >= FREE_CONDITION_LIMIT) {
      throw new Error(`Free plan includes ${FREE_CONDITION_LIMIT} conditions. Upgrade to Pro for more.`)
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      throw new Error('Sign in to continue.')
    }

    return persistFreeConditionKeys(userData.user.id, [...freeConditionKeys.value, conditionKey])
  }

  function canReplaceFreeCondition(conditionKey: string, loggedEntryCount: number) {
    if (!conditionKey || isPro.value || loggedEntryCount > 0) {
      return false
    }

    if (freeConditionKeys.value.includes(conditionKey)) {
      return false
    }

    return freeConditionKeys.value.length >= FREE_CONDITION_LIMIT
  }

  async function replaceFreeCondition(conditionKey: string, loggedEntryCount: number) {
    if (!canReplaceFreeCondition(conditionKey, loggedEntryCount)) {
      throw new Error('You can only change your free condition before logging your first entry.')
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      throw new Error('Sign in to continue.')
    }

    return persistFreeConditionKeys(userData.user.id, [conditionKey])
  }

  async function syncFreeConditionKey(conditionKey: string) {
    if (!conditionKey || isPro.value || freeConditionKeys.value.includes(conditionKey)) {
      return freeConditionKeys.value
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()

    if (userError || !userData.user) {
      throw new Error('Sign in to continue.')
    }

    return persistFreeConditionKeys(userData.user.id, [conditionKey])
  }

  async function startCheckout() {
    const accessToken = await getAccessToken()

    const response = await $fetch<{ url: string }>('/api/stripe/create-subscription-checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.url) {
      throw new Error('Stripe checkout URL was missing.')
    }

    if (import.meta.client) {
      window.location.href = response.url
    }

    return response.url
  }

  async function openBillingPortal() {
    const accessToken = await getAccessToken()

    const response = await $fetch<{ url: string }>('/api/stripe/create-portal-session', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.url) {
      throw new Error('Billing portal URL was missing.')
    }

    if (import.meta.client) {
      window.location.href = response.url
    }

    return response.url
  }

  return {
    entitlement,
    freeConditionKeys,
    isLoading,
    loadError,
    isPro,
    isComped,
    canUseCharts,
    canUseFamilyReporting,
    canExportPdf,
    freeConditionSlotsRemaining,
    renewalLabel,
    loadEntitlements,
    canTrackCondition,
    canAddFreeCondition,
    addFreeCondition,
    canReplaceFreeCondition,
    replaceFreeCondition,
    syncFreeConditionKey,
    startCheckout,
    openBillingPortal
  }
}
