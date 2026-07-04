import { computed, ref } from 'vue'

export type TrackerPasskey = {
  id: string
  friendly_name?: string
  created_at: string
  last_used_at?: string
}

type PasskeyFailure = {
  message?: string
  code?: string
  error_code?: string
  name?: string
}

function getPasskeyErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object') {
    const failure = error as PasskeyFailure
    const message = failure.message || ''
    const code = failure.error_code || failure.code || ''

    // User dismissed the browser/OS passkey prompt.
    if (failure.name === 'NotAllowedError' || /operation either timed out or was not allowed/i.test(message)) {
      return 'Passkey prompt was closed or timed out. Try again when you are ready.'
    }

    if (failure.name === 'InvalidStateError' || /credential.*already registered|excluded/i.test(message)) {
      return 'This device already has a passkey for your account.'
    }

    if (failure.name === 'SecurityError' || /relying party|rp id/i.test(message)) {
      return 'Passkeys only work on the production site (veteranscentralhub.us), not on this address.'
    }

    if (code === 'passkey_disabled' || /passkey.*disabled/i.test(message)) {
      return 'Passkey sign-in is not enabled on the server yet.'
    }

    if (code === 'email_not_confirmed' || /email not confirmed/i.test(message)) {
      return 'Confirm your email first, then sign in with your passkey.'
    }

    if (/no credentials|not found|unknown credential/i.test(message)) {
      return 'No passkey was found for this account on this device.'
    }

    if (message) {
      return message
    }
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function usePasskeys() {
  const supabase = useSupabaseClient()
  const passkeys = useState<TrackerPasskey[]>('tracker-passkeys', () => [])
  const isLoadingPasskeys = useState('tracker-passkeys-loading', () => false)
  const passkeysError = useState('tracker-passkeys-error', () => '')
  const isPasskeyBusy = ref(false)

  const isPasskeySupported = computed(() => {
    return import.meta.client
      && typeof window !== 'undefined'
      && typeof window.PublicKeyCredential !== 'undefined'
      && typeof navigator.credentials?.get === 'function'
  })

  async function signInWithPasskey() {
    if (!isPasskeySupported.value) {
      throw new Error('Passkeys are not supported in this browser.')
    }

    isPasskeyBusy.value = true

    try {
      const { data, error } = await supabase.auth.signInWithPasskey()

      if (error) {
        throw new Error(getPasskeyErrorMessage(error, 'Could not sign in with a passkey.'))
      }

      if (!data?.session || !data.user) {
        throw new Error('Passkey sign-in did not return a session. Try again.')
      }

      return data
    } catch (error) {
      throw new Error(getPasskeyErrorMessage(error, 'Could not sign in with a passkey.'))
    } finally {
      isPasskeyBusy.value = false
    }
  }

  async function registerPasskey() {
    if (!isPasskeySupported.value) {
      throw new Error('Passkeys are not supported in this browser.')
    }

    isPasskeyBusy.value = true

    try {
      const { data, error } = await supabase.auth.registerPasskey()

      if (error) {
        throw new Error(getPasskeyErrorMessage(error, 'Could not add a passkey.'))
      }

      await loadPasskeys()
      return data
    } catch (error) {
      throw new Error(getPasskeyErrorMessage(error, 'Could not add a passkey.'))
    } finally {
      isPasskeyBusy.value = false
    }
  }

  async function loadPasskeys() {
    isLoadingPasskeys.value = true
    passkeysError.value = ''

    try {
      const { data, error } = await supabase.auth.passkey.list()

      if (error) {
        throw error
      }

      passkeys.value = (data ?? []) as TrackerPasskey[]
    } catch (error) {
      passkeysError.value = getPasskeyErrorMessage(error, 'Could not load your passkeys.')
    } finally {
      isLoadingPasskeys.value = false
    }
  }

  async function renamePasskey(passkeyId: string, friendlyName: string) {
    const trimmedName = friendlyName.trim().slice(0, 120)

    if (!trimmedName) {
      throw new Error('Enter a name for this passkey.')
    }

    isPasskeyBusy.value = true

    try {
      const { error } = await supabase.auth.passkey.update({
        passkeyId,
        friendlyName: trimmedName
      })

      if (error) {
        throw new Error(getPasskeyErrorMessage(error, 'Could not rename the passkey.'))
      }

      await loadPasskeys()
    } finally {
      isPasskeyBusy.value = false
    }
  }

  async function deletePasskey(passkeyId: string) {
    isPasskeyBusy.value = true

    try {
      const { error } = await supabase.auth.passkey.delete({ passkeyId })

      if (error) {
        throw new Error(getPasskeyErrorMessage(error, 'Could not delete the passkey.'))
      }

      await loadPasskeys()
    } finally {
      isPasskeyBusy.value = false
    }
  }

  function clearPasskeys() {
    passkeys.value = []
    passkeysError.value = ''
  }

  return {
    passkeys,
    isLoadingPasskeys,
    passkeysError,
    isPasskeyBusy,
    isPasskeySupported,
    signInWithPasskey,
    registerPasskey,
    loadPasskeys,
    renamePasskey,
    deletePasskey,
    clearPasskeys
  }
}
