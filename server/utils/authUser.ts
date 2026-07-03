import type { H3Event } from 'h3'
import { createClient } from '@supabase/supabase-js'
import { getHeader } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { getSupabasePublicConfig } from './supabasePublicConfig'

function logAuth(step: string, details: Record<string, unknown> = {}) {
  console.info(`[checkout-auth] ${step}`, details)
}

function logAuthError(step: string, details: Record<string, unknown> = {}) {
  console.error(`[checkout-auth] ${step}`, details)
}

async function getUserFromBearerToken(event: H3Event) {
  const authorization = getHeader(event, 'authorization') || ''
  const token = authorization.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    return null
  }

  const { supabaseUrl, supabaseKey, source } = getSupabasePublicConfig(event)

  if (!supabaseUrl || !supabaseKey) {
    logAuthError('missing supabase public config', {
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseKey: Boolean(supabaseKey),
      source
    })
    throw createError({
      statusCode: 500,
      message: 'Supabase is not configured on the server.'
    })
  }

  logAuth('validating bearer token', {
    tokenLength: token.length,
    source,
    supabaseUrl
  })

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    logAuthError('bearer token rejected', {
      message: error?.message || 'No user returned',
      code: error?.code,
      status: error?.status,
      source
    })
    return null
  }

  logAuth('bearer token accepted', {
    userId: data.user.id,
    email: data.user.email
  })

  return {
    user: data.user,
    accessToken: token
  }
}

async function getUserFromCookies(event: H3Event) {
  logAuth('checking cookie session')

  try {
    const user = await serverSupabaseUser(event)

    if (!user) {
      logAuthError('cookie session missing user')
      return null
    }

    logAuth('cookie session accepted', {
      userId: user.id,
      email: user.email
    })

    return {
      user,
      accessToken: ''
    }
  } catch (error) {
    logAuthError('cookie session failed', {
      message: error instanceof Error ? error.message : String(error)
    })
    return null
  }
}

export async function requireAuthUser(event: H3Event) {
  const bearerAuth = await getUserFromBearerToken(event)

  if (bearerAuth) {
    return bearerAuth
  }

  const cookieAuth = await getUserFromCookies(event)

  if (cookieAuth) {
    return cookieAuth
  }

  const { source } = getSupabasePublicConfig(event)

  throw createError({
    statusCode: 401,
    message: source === 'missing'
      ? 'Supabase anon key is missing on the server.'
      : 'Sign in to continue. If you are signed in, your Supabase anon key may be wrong — check SUPABASE_ANON_KEY in .env matches the VCH project.'
  })
}
