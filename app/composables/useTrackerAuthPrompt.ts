/** Request the header Sign in panel to open (e.g. from ?login=1 or history). */
export function useTrackerAuthPrompt() {
  const signInRequested = useState('tracker-auth-prompt-open', () => false)
  const authPanelOpen = useState('tracker-auth-panel-open', () => false)

  function requestSignIn() {
    signInRequested.value = true
    authPanelOpen.value = true
  }

  function clearSignInRequest() {
    signInRequested.value = false
  }

  function setAuthPanelOpen(open: boolean) {
    authPanelOpen.value = open
    if (!open) {
      signInRequested.value = false
    }
  }

  return {
    signInRequested,
    authPanelOpen,
    requestSignIn,
    clearSignInRequest,
    setAuthPanelOpen
  }
}
