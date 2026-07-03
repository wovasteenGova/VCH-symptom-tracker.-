<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <SubmissionToast />
  </UApp>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const { showSubmissionToast } = useSubmissionToast()

function updateAppHeight() {
  if (typeof window === 'undefined') {
    return
  }

  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${Math.round(viewportHeight)}px`)
}

onMounted(() => {
  updateAppHeight()
  if (import.meta.client && window.sessionStorage.getItem('symptom-tracker-auth-success')) {
    window.sessionStorage.removeItem('symptom-tracker-auth-success')
    showSubmissionToast('Signed in.')
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
