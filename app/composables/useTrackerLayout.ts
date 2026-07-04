import { useRoute, useState } from '#imports'
import { useMediaQuery } from '@vueuse/core'
import { computed, inject, onMounted } from 'vue'

export type TrackerLayoutMode = 'auto' | 'desktop' | 'mobile'

export const TRACKER_LAYOUT_STORAGE_KEY = 'symptom-tracker-layout-mode'
export const TRACKER_EMBED_KEY = Symbol('tracker-embed')
export const TRACKER_CLOSE_EMBED_PROFILE_KEY = Symbol('close-embed-profile')

function readStoredLayoutMode(): TrackerLayoutMode {
  if (!import.meta.client) {
    return 'auto'
  }

  const stored = window.localStorage.getItem(TRACKER_LAYOUT_STORAGE_KEY)

  if (stored === 'auto' || stored === 'desktop' || stored === 'mobile') {
    return stored
  }

  return 'auto'
}

export function useTrackerLayout() {
  const route = useRoute()
  const isEmbeddedPreview = inject(TRACKER_EMBED_KEY, false)
  const matchesDesktopViewport = useMediaQuery('(min-width: 768px)')
  const layoutMode = useState<TrackerLayoutMode>('tracker-layout-mode', readStoredLayoutMode)

  if (import.meta.client) {
    onMounted(() => {
      layoutMode.value = readStoredLayoutMode()
    })
  }

  const forceDesktopFromQuery = computed(() => {
    const layout = route.query.layout
    const embed = route.query.embed

    return layout === 'desktop' || embed === 'desktop' || embed === '1' || embed === 'true'
  })

  const isDesktopLayout = computed(() => {
    if (isEmbeddedPreview || forceDesktopFromQuery.value) {
      return true
    }

    if (layoutMode.value === 'desktop') {
      return true
    }

    if (layoutMode.value === 'mobile') {
      return false
    }

    return matchesDesktopViewport.value
  })

  const isMobileLayout = computed(() => !isDesktopLayout.value)

  function setLayoutMode(mode: TrackerLayoutMode) {
    layoutMode.value = mode

    if (import.meta.client) {
      window.localStorage.setItem(TRACKER_LAYOUT_STORAGE_KEY, mode)
    }
  }

  return {
    layoutMode,
    isDesktopLayout,
    isMobileLayout,
    isEmbeddedPreview,
    setLayoutMode
  }
}
