import { readBootstrapColorTheme } from '../composables/useClaimColorTheme'

/** Apply saved palette before first paint to reduce theme flash. */
export default defineNuxtPlugin(() => {
  document.documentElement.dataset.theme = readBootstrapColorTheme()
})
