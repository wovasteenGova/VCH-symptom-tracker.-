<template>
  <UApp>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </UApp>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

function updateAppHeight() {
  if (typeof window === 'undefined') {
    return
  }

  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${Math.round(viewportHeight)}px`)
}

onMounted(() => {
  updateAppHeight()
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
