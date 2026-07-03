<template>
  <main class="flex min-h-dvh flex-col bg-slate-950 text-white">
    <section class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10 sm:max-w-lg">
      <div class="rounded-4xl border border-slate-800 bg-slate-900 p-6 text-center">
        <div
          class="mx-auto grid size-16 place-items-center rounded-full"
          :class="isActivated ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'"
        >
          <UIcon :name="isActivated ? 'i-lucide-party-popper' : 'i-lucide-loader-circle'" :class="isActivated ? 'size-8' : 'size-8 animate-spin'" />
        </div>

        <h1 class="mt-5 text-2xl font-bold text-white">
          {{ isActivated ? 'Welcome to Pro' : 'Activating Pro...' }}
        </h1>

        <p class="mt-3 text-sm leading-6 text-slate-300">
          <span v-if="isActivated">
            Your subscription is active. Unlimited entries, family reporting, and PDF exports are ready.
          </span>
          <span v-else>
            Payment received. We're confirming your subscription — this usually takes a few seconds.
          </span>
        </p>

        <p v-if="statusMessage" class="mt-4 text-xs leading-5 text-slate-400">{{ statusMessage }}</p>
        <p v-if="pageError" class="mt-4 text-sm font-medium text-red-300">{{ pageError }}</p>

        <div class="mt-6 space-y-3">
          <NuxtLink
            to="/"
            class="block w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 transition hover:bg-slate-200"
          >
            Start tracking
          </NuxtLink>
          <NuxtLink
            to="/upgrade"
            class="block w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700"
          >
            View plan details
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSupabaseAuth } from '../../composables/useSupabaseAuth'
import { useEntitlements } from '../../composables/useEntitlements'

const route = useRoute()
const { user, isAuthLoading } = useSupabaseAuth()
const { isPro, loadEntitlements } = useEntitlements()

const pageError = ref('')
const pollAttempts = ref(0)
let pollTimer: ReturnType<typeof setInterval> | undefined

const isActivated = computed(() => isPro.value)
const statusMessage = computed(() => {
  if (isActivated.value) {
    return 'Thank you for helping fund the Claim Maker build.'
  }

  if (pollAttempts.value >= 8) {
    return 'If Pro is not active yet, refresh in a minute or contact us — we will fix it.'
  }

  return 'Waiting for Stripe confirmation...'
})

async function refreshEntitlement() {
  pollAttempts.value += 1

  try {
    await loadEntitlements()
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : 'Could not refresh plan status.'
  }
}

onMounted(async () => {
  if (!route.query.session_id) {
    pageError.value = 'Missing checkout session. If you paid, contact us and we will activate Pro manually.'
  }

  if (user.value) {
    await refreshEntitlement()
  }

  pollTimer = setInterval(async () => {
    if (isPro.value || pollAttempts.value >= 8) {
      if (pollTimer) {
        clearInterval(pollTimer)
      }
      return
    }

    await refreshEntitlement()
  }, 2500)
})

watch(isAuthLoading, async (loading) => {
  if (!loading && user.value) {
    await refreshEntitlement()
  }
})

watch(user, async (currentUser) => {
  if (currentUser) {
    await refreshEntitlement()
  }
})

onUnmounted(() => {
  if (pollTimer) {
    clearInterval(pollTimer)
  }
})
</script>
