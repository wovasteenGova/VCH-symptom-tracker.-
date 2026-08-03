import { readBootstrapColorTheme } from '../composables/useClaimColorTheme'

/** Apply saved palette before paint, then hydrate Vue state after mount. */
export default defineNuxtPlugin((nuxtApp) => {
  document.documentElement.dataset.theme = readBootstrapColorTheme()

  const {
    hydrateThemeFromStorage,
    syncThemeFromDocument
  } = useClaimColorTheme()

  nuxtApp.hook('app:mounted', () => {
    hydrateThemeFromStorage()
    requestAnimationFrame(hydrateThemeFromStorage)

    const observer = new MutationObserver(syncThemeFromDocument)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    })
  })
})
