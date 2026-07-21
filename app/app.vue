<template>
  <UApp>
    <Transition name="app-splash-fade">
      <div
        v-if="showAppSplash"
        class="fixed inset-0 z-[100] grid place-items-center bg-slate-950 px-4"
        aria-hidden="true"
      >
        <div class="flex w-full max-w-[min(28rem,92vw)] flex-col items-center gap-4 sm:max-w-[32rem]">
          <div class="flex items-center justify-center gap-3">
            <img
              src="/vch-logo.png"
              alt="Veterans Central Hub"
              class="size-11 shrink-0 rounded-full object-cover object-center ring-1 ring-slate-700 shadow-sm"
              decoding="async"
            >
            <span class="text-[2rem] font-semibold leading-none tracking-[0.12em] text-white">
              VCH
            </span>
          </div>
          <img
            src="/vch-tank-loader.svg"
            alt=""
            class="w-full select-none"
            decoding="async"
          >
        </div>
      </div>
    </Transition>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <SubmissionToast v-if="showGlobalSubmissionToast" />
  </UApp>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import { useMediaQuery } from '@vueuse/core'

useHead({
  htmlAttrs: {
    lang: 'en',
    'data-theme': 'classic-warm'
  }
})

const { showSubmissionToast } = useSubmissionToast()
const supabase = useSupabaseClient()
const route = useRoute()
const isDesktopViewport = useMediaQuery('(min-width: 768px)')
const showGlobalSubmissionToast = computed(() => {
  if (route.path === '/' && isDesktopViewport.value) {
    return false
  }

  return true
})

const showAppSplash = ref(true)
// Skip the splash when the page reloads shortly after showing it (e.g. the
// PWA service worker auto-update reload), so users don't see it twice.
const APP_SPLASH_REPLAY_WINDOW_MS = 60_000
const APP_SPLASH_SHOWN_AT_KEY = 'symptom-tracker-splash-shown-at'
const CHECKOUT_SUCCESS_TOAST_KEY = 'symptom-tracker-checkout-success-toast'

function dismissAppSplash() {
  showAppSplash.value = false
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
  dismissAppSplash()
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
