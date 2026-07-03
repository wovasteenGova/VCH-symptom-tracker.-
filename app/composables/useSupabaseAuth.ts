import type { User } from '@supabase/supabase-js'
import { onMounted, onUnmounted } from 'vue'

type AuthFailure = {
  message?: string
  msg?: string
  code?: string
  error_code?: string
  status?: number
}

function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase()
}

function validateAuthEmail(email: string) {
  const normalized = normalizeAuthEmail(email)

  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Enter a valid email address.')
  }

  return normalized
}

export function useSupabaseAuth() {
  const supabase = useSupabaseClient()
  const user = useState<User | null>('tracker-auth-user', () => null)
  const isAuthLoading = useState('tracker-auth-loading', () => true)
  const authError = useState('tracker-auth-error', () => '')
  let unsubscribe: (() => void) | undefined

  function getAuthErrorMessage(error: unknown) {
    if (error && typeof error === 'object') {
      const failure = error as AuthFailure
      const message = failure.message || failure.msg || ''

      if (
        failure.error_code === 'email_not_confirmed'
        || failure.code === 'email_not_confirmed'
        || /email not confirmed/i.test(message)
      ) {
        return 'Confirm your email first. Check spam for mail from Supabase, or tap Resend confirmation email below.'
      }

      if (
        failure.error_code === 'invalid_credentials'
        || failure.code === 'invalid_credentials'
        || /invalid login credentials/i.test(message)
      ) {
        return 'Wrong password for this email. Use Forgot password, Continue with Google, or the password from veteranscentralhub.us.'
      }

      if (
        failure.error_code === 'user_already_exists'
        || failure.code === 'user_already_exists'
        || failure.error_code === 'email_exists'
        || failure.code === 'email_exists'
        || /already (been )?registered|already exists|user already registered/i.test(message)
      ) {
        return 'An account with this email already exists. Switch to Sign in or use Forgot password.'
      }

      if (
        failure.error_code === 'signup_disabled'
        || failure.code === 'signup_disabled'
        || /signups? (are )?disabled/i.test(message)
      ) {
        return 'New signups are temporarily disabled. Try Sign in, Continue with Google, or contact support.'
      }

      if (
        failure.error_code === 'validation_failed'
        || failure.code === 'validation_failed'
        || /unable to validate email address/i.test(message)
        || /email address.*invalid/i.test(message)
      ) {
        return 'Enter a valid email address.'
      }

      if (failure.status === 400 && message) {
        return message
      }

      if (message) {
        return message
      }
    }

    if (error instanceof Error) {
      if (/failed to fetch|fetch failed|networkerror|load failed/i.test(error.message)) {
        return 'Could not reach Supabase. Check your internet connection, Supabase project URL, and browser/network blocking.'
      }

      if (/invalid login credentials/i.test(error.message)) {
        return 'Wrong password for this email. Use Forgot password, Continue with Google, or the password from veteranscentralhub.us.'
      }

      return error.message
    }

    return 'Authentication failed. Please try again.'
  }

  onMounted(async () => {
    try {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        authError.value = getAuthErrorMessage(error)
      } else {
        user.value = data.user
      }
    } catch (error) {
      authError.value = getAuthErrorMessage(error)
    }

    const listener = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
    })

    unsubscribe = listener.data.subscription.unsubscribe
    isAuthLoading.value = false
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  function requireAuthEmail(email: string) {
    try {
      return validateAuthEmail(email)
    } catch (error) {
      authError.value = getAuthErrorMessage(error)
      throw error
    }
  }

  async function signIn(email: string, password: string) {
    authError.value = ''
    const normalizedEmail = requireAuthEmail(email)

    let error: unknown

    try {
      const result = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      })
      error = result.error
    } catch (caughtError) {
      error = caughtError
    }

    if (error) {
      authError.value = getAuthErrorMessage(error)
      throw error
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    authError.value = ''
    const normalizedEmail = requireAuthEmail(email)

    const emailRedirectTo = import.meta.client
      ? `${window.location.origin}/app`
      : undefined

    let data
    let error: unknown

    try {
      const result = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo,
          data: {
            full_name: fullName
          }
        }
      })
      data = result.data
      error = result.error
    } catch (caughtError) {
      error = caughtError
    }

    if (error) {
      authError.value = getAuthErrorMessage(error)
      throw error
    }

    if (data.user?.identities?.length === 0) {
      const message = 'An account with this email already exists. Switch to Sign in or use Forgot password.'
      authError.value = message
      throw new Error(message)
    }

    if (data.session) {
      return data
    }

    if (data.user) {
      try {
        await signIn(normalizedEmail, password)
      } catch (signInError) {
        if (/confirm your email/i.test(authError.value)) {
          throw signInError
        }

        if (!data.user.confirmed_at) {
          authError.value = 'Account created. Confirm your email, then sign in. Check spam for mail from Supabase.'
        } else {
          authError.value = authError.value || 'Account created, but sign-in did not start. Try Sign in with the same password.'
        }

        throw signInError
      }

      const { data: sessionData } = await supabase.auth.getSession()

      return {
        user: sessionData.session?.user ?? data.user,
        session: sessionData.session
      }
    }

    authError.value = 'Signup did not return a user. Try again or contact support.'
    throw new Error(authError.value)
  }

  async function resendConfirmationEmail(email: string) {
    authError.value = ''
    const normalizedEmail = requireAuthEmail(email)

    const emailRedirectTo = import.meta.client
      ? `${window.location.origin}/app`
      : undefined

    let error: unknown

    try {
      const result = await supabase.auth.resend({
        type: 'signup',
        email: normalizedEmail,
        options: {
          emailRedirectTo
        }
      })
      error = result.error
    } catch (caughtError) {
      error = caughtError
    }

    if (error) {
      authError.value = getAuthErrorMessage(error)
      throw error
    }
  }

  async function signInWithGoogle() {
    authError.value = ''

    const redirectTo = import.meta.client
      ? `${window.location.origin}/app`
      : undefined

    let error: unknown

    try {
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })
      error = result.error
    } catch (caughtError) {
      error = caughtError
    }

    if (error) {
      authError.value = getAuthErrorMessage(error)
      throw error
    }
  }

  async function sendPasswordReset(email: string) {
    authError.value = ''
    const normalizedEmail = requireAuthEmail(email)

    const redirectTo = import.meta.client
      ? window.location.origin
      : undefined

    let error: unknown

    try {
      const result = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo
      })
      error = result.error
    } catch (caughtError) {
      error = caughtError
    }

    if (error) {
      authError.value = getAuthErrorMessage(error)
      throw error
    }
  }

  async function signOut() {
    authError.value = ''

    let error: unknown

    try {
      const result = await supabase.auth.signOut()
      error = result.error
    } catch (caughtError) {
      error = caughtError
    }

    if (error) {
      authError.value = getAuthErrorMessage(error)
      throw error
    }
  }

  async function verifyPassword(email: string, password: string) {
    if (!password) {
      throw new Error('Enter your password to continue.')
    }

    const normalizedEmail = requireAuthEmail(email)

    let error: unknown

    try {
      const result = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password
      })
      error = result.error
    } catch (caughtError) {
      error = caughtError
    }

    if (error) {
      throw new Error('Incorrect password.')
    }
  }

  return {
    user,
    isAuthLoading,
    authError,
    signIn,
    signUp,
    resendConfirmationEmail,
    signInWithGoogle,
    sendPasswordReset,
    signOut,
    verifyPassword
  }
}
