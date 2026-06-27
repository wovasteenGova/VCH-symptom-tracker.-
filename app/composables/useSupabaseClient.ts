import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

export function useSupabaseClient() {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabasePublishableKey = config.public.supabasePublishableKey

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Missing Supabase config. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.')
  }

  if (import.meta.client && browserClient) {
    return browserClient
  }

  const client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })

  if (import.meta.client) {
    browserClient = client
  }

  return client
}
