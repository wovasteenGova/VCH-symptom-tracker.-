import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseAuth } from './useSupabaseAuth'
import {
  resolvePendingCheckoutSessionId,
  useEntitlements
} from './useEntitlements'

const MAX_SYNC_ATTEMPTS = 15
const SYNC_INTERVAL_MS = 2000

export function useCheckoutCompletion() {
  const route = useRoute()
  const { user, isAuthLoading } = useSupabaseAuth()
  const { isPro, loadEntitlements, activateCheckoutSession } = useEntitlements()

  const pageError = ref('')
  const isSyncing = ref(false)
  const isCompletionRunning = ref(false)
  const syncAttempts = ref(0)
  const paymentReceived = ref(false)

  const checkoutSessionId = computed(() => {
    return resolvePendingCheckoutSessionId(
      typeof route.query.session_id === 'string' ? route.query.session_id : ''
    )
  })

  async function syncProAccess() {
    const sessionId = checkoutSessionId.value

    if (!sessionId || isAuthLoading.value || !user.value) {
      return false
    }

    syncAttempts.value += 1
    isSyncing.value = true

    try {
      await loadEntitlements({ force: true })

      if (isPro.value) {
        paymentReceived.value = true
        pageError.value = ''
        return true
      }

      await activateCheckoutSession(sessionId)
      await loadEntitlements({ force: true })

      paymentReceived.value = true
      pageError.value = ''
      return isPro.value
    } catch (error) {
      pageError.value = error instanceof Error
        ? error.message
        : 'Could not activate Pro yet.'

      try {
        await loadEntitlements({ force: true })
      } catch {
        // Keep the activation error visible.
      }

      return isPro.value
    } finally {
      isSyncing.value = false
    }
  }

  async function runCheckoutCompletionLoop() {
    if (isCompletionRunning.value) {
      return
    }

    if (!checkoutSessionId.value) {
      pageError.value = 'Missing checkout session. If you paid, contact us with your receipt.'
      return
    }

    isCompletionRunning.value = true
    paymentReceived.value = true
    syncAttempts.value = 0
    pageError.value = ''

    try {
      for (let attempt = 0; attempt < MAX_SYNC_ATTEMPTS && !isPro.value; attempt += 1) {
        if (user.value && !isAuthLoading.value) {
          const activated = await syncProAccess()

          if (activated) {
            return
          }
        }

        if (attempt < MAX_SYNC_ATTEMPTS - 1) {
          await new Promise<void>((resolve) => {
            window.setTimeout(resolve, SYNC_INTERVAL_MS)
          })
        }
      }
    } finally {
      isCompletionRunning.value = false
    }
  }

  return {
    checkoutSessionId,
    pageError,
    isSyncing,
    syncAttempts,
    paymentReceived,
    maxSyncAttempts: MAX_SYNC_ATTEMPTS,
    syncProAccess,
    runCheckoutCompletionLoop
  }
}
