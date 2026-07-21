<template>
  <div
    class="relative h-full min-h-0 overflow-hidden"
    @mouseenter="demoMode.pause()"
    @mouseleave="demoMode.resume()"
    @pointerdown="handlePreviewPointerDown"
  >
    <TrackerAppPage />
  </div>
</template>

<script setup lang="ts">
import TrackerAppPage from '~/pages/app/index.vue'
import { useTrackerDemoMode } from '~/composables/useTrackerDemoMode'
import {
  TRACKER_DEMO_CONTROL_KEY,
  TRACKER_DEMO_KEY,
  TRACKER_EMBED_KEY
} from '~/composables/useTrackerLayout'

const demoMode = useTrackerDemoMode()

function handlePreviewPointerDown(event: PointerEvent) {
  const target = event.target

  if (target instanceof Element && target.closest('[aria-labelledby="auth-panel-title"]')) {
    return
  }

  demoMode.takeOver()
}

provide(TRACKER_EMBED_KEY, true)
provide(TRACKER_DEMO_KEY, true)
provide(TRACKER_DEMO_CONTROL_KEY, demoMode)
</script>
