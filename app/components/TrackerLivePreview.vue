<template>
  <div class="h-full min-h-0 overflow-hidden">
    <TrackerAppPage />
  </div>
</template>

<script setup lang="ts">
import TrackerAppPage from '~/pages/app/index.vue'
import { TRACKER_EMBED_KEY } from '~/composables/useTrackerLayout'

provide(TRACKER_EMBED_KEY, true)
</script>
