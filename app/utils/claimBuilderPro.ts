export const CLAIMBUILDER_PRO_URL_PARAM = 'claimbuilder_pro'
export const CLAIMBUILDER_PRO_SESSION_KEY = 'symptom-tracker-claimbuilder-pro'

export function shouldCheckClaimBuilderPro(routeQuery: Record<string, unknown>) {
  if (routeQuery[CLAIMBUILDER_PRO_URL_PARAM] === '1') {
    return true
  }

  return readClaimBuilderProLink()
}

export function rememberClaimBuilderProLink() {
  if (import.meta.client) {
    window.sessionStorage.setItem(CLAIMBUILDER_PRO_SESSION_KEY, '1')
  }
}

export function readClaimBuilderProLink() {
  if (!import.meta.client) {
    return false
  }

  return window.sessionStorage.getItem(CLAIMBUILDER_PRO_SESSION_KEY) === '1'
}
