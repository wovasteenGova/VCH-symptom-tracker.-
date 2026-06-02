import { createClient } from '@supabase/supabase-js'

export function useSupabaseClient() {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabasePublishableKey = config.public.supabasePublishableKey

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Missing Supabase config. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.')
  }

  return createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}
