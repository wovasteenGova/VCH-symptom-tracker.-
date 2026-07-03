import { computed, ref } from 'vue'
import {
  FREE_ENTRY_LIMIT,
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
  const veteranEntryCount = ref(0)
  const isLoading = ref(false)
  const loadError = ref('')

  const isPro = computed(() => isActiveEntitlementStatus(entitlement.value?.status))
  const isComped = computed(() => entitlement.value?.status === 'comped')
  const entriesRemaining = computed(() => Math.max(0, FREE_ENTRY_LIMIT - veteranEntryCount.value))
  const hasReachedEntryLimit = computed(() => !isPro.value && veteranEntryCount.value >= FREE_ENTRY_LIMIT)
  const canUseFamilyReporting = computed(() => isPro.value)
  const canExportPdf = computed(() => isPro.value)
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

  async function loadEntitlements() {
    isLoading.value = true
    loadError.value = ''

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        entitlement.value = null
        veteranEntryCount.value = 0
        return
      }

      const [{ data: entitlementData, error: entitlementError }, { count, error: countError }] = await Promise.all([
        supabase
          .from('user_entitlements')
          .select('user_id, product_key, status, stripe_customer_id, stripe_subscription_id, current_period_end, granted_by, grant_note, unlocked_at')
          .eq('user_id', userData.user.id)
          .eq('product_key', PRO_PRODUCT_KEY)
          .maybeSingle(),
        supabase
          .from('symptom_entries')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userData.user.id)
          .eq('source', 'veteran')
      ])

      if (entitlementError) {
        throw entitlementError
      }

      if (countError) {
        throw countError
      }

      entitlement.value = entitlementData
      veteranEntryCount.value = count || 0
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : 'Could not load plan details.'
    } finally {
      isLoading.value = false
    }
  }

  function canCreateEntry(isEditingExisting = false) {
    if (isEditingExisting || isPro.value) {
      return true
    }

    return veteranEntryCount.value < FREE_ENTRY_LIMIT
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
    veteranEntryCount,
    isLoading,
    loadError,
    isPro,
    isComped,
    entriesRemaining,
    hasReachedEntryLimit,
    canUseFamilyReporting,
    canExportPdf,
    renewalLabel,
    loadEntitlements,
    canCreateEntry,
    startCheckout,
    openBillingPortal
  }
}
