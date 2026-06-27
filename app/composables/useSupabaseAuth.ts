import type { User } from '@supabase/supabase-js'
import { onMounted, onUnmounted, ref } from 'vue'

export function useSupabaseAuth() {
  const supabase = useSupabaseClient()
  const user = ref<User | null>(null)
  const isAuthLoading = ref(true)
  const authError = ref('')
  let unsubscribe: (() => void) | undefined

  onMounted(async () => {
    const { data, error } = await supabase.auth.getUser()

    if (!error) {
      user.value = data.user
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      authError.value = error.message
      throw error
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    authError.value = ''

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) {
      authError.value = error.message
      throw error
    }

    return data
  }

  async function signInWithGoogle() {
    authError.value = ''

    const redirectTo = import.meta.client
      ? window.location.origin
      : undefined

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo
      }
    })

    if (error) {
      authError.value = error.message
      throw error
    }
  }

  async function sendPasswordReset(email: string) {
    authError.value = ''

    const redirectTo = import.meta.client
      ? window.location.origin
      : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    })

    if (error) {
      authError.value = error.message
      throw error
    }
  }

  async function signOut() {
    authError.value = ''

    const { error } = await supabase.auth.signOut()

    if (error) {
      authError.value = error.message
      throw error
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
    signOut
  }
}
