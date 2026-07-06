import { onBeforeUnmount, watch, type Ref } from 'vue'

/** Matches `.home-history-panel.is-history-expanded` overlay padding on the app page. */
export const APP_OVERLAY_HISTORY_EXPANDED_INSET = 'var(--history-sheet-expanded-height)'
export const APP_OVERLAY_HISTORY_COLLAPSED_INSET = 'var(--history-sheet-collapsed-height)'
/** When History chrome is hidden, overlays cover the full frame. */
export const APP_OVERLAY_HISTORY_HIDDEN_INSET = 'env(safe-area-inset-bottom, 0px)'

export function syncAppOverlayHistoryInset(expanded: boolean, historyHidden = false) {
  if (!import.meta.client) {
    return
  }

  if (historyHidden) {
    document.documentElement.style.setProperty(
      '--app-overlay-history-inset',
      APP_OVERLAY_HISTORY_HIDDEN_INSET
    )
    return
  }

  document.documentElement.style.setProperty(
    '--app-overlay-history-inset',
    expanded ? APP_OVERLAY_HISTORY_EXPANDED_INSET : APP_OVERLAY_HISTORY_COLLAPSED_INSET
  )
}

export function clearAppOverlayHistoryInset() {
  if (!import.meta.client) {
    return
  }

  document.documentElement.style.removeProperty('--app-overlay-history-inset')
}

/**
 * Keeps `--app-overlay-history-inset` aligned with the History bottom sheet.
 * Use on the app page; overlays using `.app-overlay-shell` read this automatically.
 */
export function useAppOverlayHistoryInset(
  historyExpanded: Ref<boolean>,
  options?: { historyHidden?: Ref<boolean> }
) {
  const sync = () => {
    syncAppOverlayHistoryInset(
      historyExpanded.value,
      options?.historyHidden?.value ?? false
    )
  }

  watch(
    () => [historyExpanded.value, options?.historyHidden?.value] as const,
    sync,
    { immediate: true }
  )

  onBeforeUnmount(() => {
    clearAppOverlayHistoryInset()
  })
}
