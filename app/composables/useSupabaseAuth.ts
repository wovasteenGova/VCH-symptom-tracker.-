import type { User } from '@supabase/supabase-js'
import { onMounted, onUnmounted, ref } from 'vue'

export function useSupabaseAuth() {
  const supabase = useSupabaseClient()
  const user = ref<User | null>(null)
  const isAuthLoading = ref(true)
  const authError = ref('')
  let unsubscribe: (() => void) | undefined

  function getAuthErrorMessage(error: unknown) {
    if (error instanceof Error) {
      if (/failed to fetch|fetch failed|networkerror|load failed/i.test(error.message)) {
        return 'Could not reach Supabase. Check your internet connection, Supabase project URL, and browser/network blocking.'
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

  async function signIn(email: string, password: string) {
    authError.value = ''

    let error: unknown

    try {
      const result = await supabase.auth.signInWithPassword({
        email,
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

    let data
    let error: unknown

    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
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

    return data
  }

  async function signInWithGoogle() {
    authError.value = ''

    const redirectTo = import.meta.client
      ? window.location.origin
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

    const redirectTo = import.meta.client
      ? window.location.origin
      : undefined

    let error: unknown

    try {
      const result = await supabase.auth.resetPasswordForEmail(email, {
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
    if (!email.trim() || !password) {
      throw new Error('Enter your password to continue.')
    }

    let error: unknown

    try {
      const result = await supabase.auth.signInWithPassword({
        email: email.trim(),
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
    signInWithGoogle,
    sendPasswordReset,
    signOut,
    verifyPassword
  }
}
