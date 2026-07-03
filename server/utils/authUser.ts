import type { H3Event } from 'h3'
import { getHeader } from 'h3'
import { getSupabaseAdmin } from './supabaseAdmin'

export async function requireAuthUser(event: H3Event) {
  const authorization = getHeader(event, 'authorization') || ''
  const token = authorization.replace(/^Bearer\s+/i, '').trim()

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Sign in to continue.'
    })
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    throw createError({
      statusCode: 401,
      message: 'Your session expired. Sign in again.'
    })
  }

  return {
    user: data.user,
    accessToken: token
  }
}
