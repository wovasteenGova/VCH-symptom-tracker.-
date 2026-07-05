<template>
  <UApp>
    <Transition name="app-splash-fade">
      <div
        v-if="showAppSplash"
        class="fixed inset-0 z-[100] grid place-items-center bg-slate-950"
        aria-hidden="true"
      >
        <img src="/vch-tank-loader.svg" alt="" class="w-72 max-w-[85vw] sm:w-80">
      </div>
    </Transition>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <SubmissionToast />
  </UApp>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted, ref } from 'vue'

const { showSubmissionToast } = useSubmissionToast()
const supabase = useSupabaseClient()

const showAppSplash = ref(true)
const APP_SPLASH_MIN_MS = 1200
// Skip the splash when the page reloads shortly after showing it (e.g. the
// PWA service worker auto-update reload), so users don't see it twice.
const APP_SPLASH_REPLAY_WINDOW_MS = 60_000
const APP_SPLASH_SHOWN_AT_KEY = 'symptom-tracker-splash-shown-at'
const CHECKOUT_SUCCESS_TOAST_KEY = 'symptom-tracker-checkout-success-toast'

function dismissAppSplash(mountedAt: number) {
  const elapsed = Date.now() - mountedAt
  window.setTimeout(() => {
    showAppSplash.value = false
  }, Math.max(0, APP_SPLASH_MIN_MS - elapsed))
}

onBeforeMount(() => {
  updateAppHeight()

  try {
    const shownAt = Number(window.sessionStorage.getItem(APP_SPLASH_SHOWN_AT_KEY) || 0)

    if (shownAt && Date.now() - shownAt < APP_SPLASH_REPLAY_WINDOW_MS) {
      showAppSplash.value = false
      return
    }

    window.sessionStorage.setItem(APP_SPLASH_SHOWN_AT_KEY, String(Date.now()))
  } catch {
    // sessionStorage unavailable (private mode edge cases) — keep default splash.
  }
})

function updateAppHeight() {
  if (typeof window === 'undefined') {
    return
  }

  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${Math.round(viewportHeight)}px`)
}

onMounted(async () => {
  dismissAppSplash(Date.now())
  updateAppHeight()
  if (import.meta.client && window.sessionStorage.getItem(CHECKOUT_SUCCESS_TOAST_KEY)) {
    window.sessionStorage.removeItem(CHECKOUT_SUCCESS_TOAST_KEY)
    window.sessionStorage.removeItem('symptom-tracker-auth-success')
    showSubmissionToast({
      message: "Payment successful. You're now on Pro.",
      durationMs: 3200
    })
  } else if (import.meta.client && window.sessionStorage.getItem('symptom-tracker-auth-success')) {
    window.sessionStorage.removeItem('symptom-tracker-auth-success')

    const { data } = await supabase.auth.getSession()

    if (data.session) {
      showSubmissionToast('Signed in.')
    }
  }
  window.addEventListener('resize', updateAppHeight)
  window.addEventListener('orientationchange', updateAppHeight)
  window.visualViewport?.addEventListener('resize', updateAppHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateAppHeight)
  window.removeEventListener('orientationchange', updateAppHeight)
  window.visualViewport?.removeEventListener('resize', updateAppHeight)
})
</script>

<style>
.app-splash-fade-leave-active {
  transition: opacity 0.35s ease;
}

.app-splash-fade-leave-to {
  opacity: 0;
}
</style>
