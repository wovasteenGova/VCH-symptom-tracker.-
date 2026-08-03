import {
  CLAIM_COLOR_THEME_STORAGE_KEY,
  CLAIM_COLOR_THEMES,
  DEFAULT_CLAIM_COLOR_THEME,
  claimColorThemeById,
  isClaimColorThemeId,
  type ClaimColorThemeId
} from '#shared/claimColorThemes'

export function readBootstrapColorTheme(): ClaimColorThemeId {
  if (import.meta.client) {
    const stored = localStorage.getItem(CLAIM_COLOR_THEME_STORAGE_KEY)
    if (isClaimColorThemeId(stored)) return stored

    const applied = document.documentElement.dataset.theme
    if (isClaimColorThemeId(applied)) return applied
  }

  return DEFAULT_CLAIM_COLOR_THEME
}

function applyThemeToDocument(themeId: ClaimColorThemeId) {
  if (!import.meta.client) return
  document.documentElement.dataset.theme = themeId
}

export function useClaimColorTheme() {
  const themeId = useState<ClaimColorThemeId>(
    'claim-color-theme',
    () => DEFAULT_CLAIM_COLOR_THEME
  )

  const activeTheme = computed(() => claimColorThemeById(themeId.value))

  function applyTheme(next: ClaimColorThemeId) {
    if (themeId.value !== next) {
      themeId.value = next
    }
    applyThemeToDocument(next)
    if (import.meta.client) {
      localStorage.setItem(CLAIM_COLOR_THEME_STORAGE_KEY, next)
    }
  }

  function setTheme(next: ClaimColorThemeId) {
    applyTheme(next)
  }

  function hydrateThemeFromStorage() {
    applyTheme(readBootstrapColorTheme())
  }

  function syncThemeFromDocument() {
    if (!import.meta.client) return false
    const applied = document.documentElement.dataset.theme
    if (!isClaimColorThemeId(applied)) return false
    if (themeId.value !== applied) {
      themeId.value = applied
    }
    localStorage.setItem(CLAIM_COLOR_THEME_STORAGE_KEY, applied)
    return true
  }

  return {
    themeId,
    activeTheme,
    themes: CLAIM_COLOR_THEMES,
    setTheme,
    applyTheme,
    hydrateThemeFromStorage,
    syncThemeFromDocument
  }
}
