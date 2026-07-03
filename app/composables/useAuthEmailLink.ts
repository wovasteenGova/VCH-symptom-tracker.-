import type { Session } from '@supabase/supabase-js'

type EmailLinkResult = {
  session: Session | null
  linkType: string | null
}

function readHashParams() {
  if (!import.meta.client || !window.location.hash) {
    return new URLSearchParams()
  }

  return new URLSearchParams(window.location.hash.replace(/^#/, ''))
}

export async function establishSessionFromEmailLink(): Promise<EmailLinkResult> {
  const supabase = useSupabaseClient()
  const route = useRoute()

  const queryCode = route.query.code
  const queryType = typeof route.query.type === 'string' ? route.query.type : null
  const tokenHash = route.query.token_hash

  if (typeof queryCode === 'string' && queryCode) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(queryCode)

    if (error) {
      throw error
    }

    return {
      session: data.session,
      linkType: queryType
    }
  }

  if (typeof tokenHash === 'string' && tokenHash) {
    const otpType = (queryType || 'signup') as 'signup' | 'recovery' | 'email' | 'invite' | 'magiclink'
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType
    })

    if (error) {
      throw error
    }

    return {
      session: data.session,
      linkType: queryType || otpType
    }
  }

  if (import.meta.client) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 150)
    })
  }

  const hashParams = readHashParams()
  const hashType = hashParams.get('type')

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

  if (sessionError) {
    throw sessionError
  }

  if (sessionData.session) {
    return {
      session: sessionData.session,
      linkType: hashType || queryType
    }
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    throw userError
  }

  if (userData.user) {
    const { data: refreshedSession } = await supabase.auth.getSession()

    return {
      session: refreshedSession.session,
      linkType: hashType || queryType
    }
  }

  return {
    session: null,
    linkType: hashType || queryType
  }
}
