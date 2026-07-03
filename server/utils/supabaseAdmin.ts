import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const config = useRuntimeConfig()
  const supabaseUrl = String(config.public.supabaseUrl || '').trim()
  const serviceRoleKey = String(config.supabaseServiceRoleKey || '').trim()

  if (!supabaseUrl || !serviceRoleKey) {
    throw createError({
      statusCode: 500,
      message: 'Supabase service role is not configured on the server.'
    })
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}
