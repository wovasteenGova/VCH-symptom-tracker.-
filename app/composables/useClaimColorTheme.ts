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
  }

  return DEFAULT_CLAIM_COLOR_THEME
}

function applyThemeToDocument(themeId: ClaimColorThemeId) {
  if (!import.meta.client) return
  document.documentElement.dataset.theme = themeId
}

export function useClaimColorTheme() {
  const themeId = useState<ClaimColorThemeId>('claim-color-theme', () => DEFAULT_CLAIM_COLOR_THEME)

  const activeTheme = computed(() => claimColorThemeById(themeId.value))

  function applyTheme(next: ClaimColorThemeId) {
    themeId.value = next
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

  return {
    themeId,
    activeTheme,
    themes: CLAIM_COLOR_THEMES,
    setTheme,
    applyTheme,
    hydrateThemeFromStorage
  }
}
