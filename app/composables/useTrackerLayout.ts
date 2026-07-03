import { useMediaQuery } from '@vueuse/core'

export type TrackerLayoutMode = 'auto' | 'desktop' | 'mobile'

export const TRACKER_LAYOUT_STORAGE_KEY = 'symptom-tracker-layout-mode'

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

    return layout === 'desktop' || embed === 'desktop'
  })

  const isDesktopLayout = computed(() => {
    if (forceDesktopFromQuery.value) {
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
    setLayoutMode
  }
}
