import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null

function extractSupabaseProjectRef(supabaseUrl: string) {
  try {
    return new URL(supabaseUrl.trim()).hostname.split('.')[0] || ''
  } catch {
    return ''
  }
}

function extractAnonKeyProjectRef(anonKey: string) {
  if (anonKey.startsWith('sb_publishable_')) {
    return null
  }

  const parts = anonKey.split('.')
  if (parts.length < 2) {
    return null
  }

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.ref === 'string' ? payload.ref : null
  } catch {
    return null
  }
}

function assertSupabaseConfigMatches(supabaseUrl: string, supabaseKey: string) {
  const urlRef = extractSupabaseProjectRef(supabaseUrl)
  const keyRef = extractAnonKeyProjectRef(supabaseKey)

  if (urlRef && keyRef && urlRef !== keyRef) {
    throw new Error(
      `Supabase URL and anon key are from different projects (URL project: ${urlRef}, key project: ${keyRef}). Copy both values from the same Supabase project: Settings → API.`
    )
  }
}

export function useSupabaseClient() {
  const config = useRuntimeConfig()
  const supabaseUrl = String(config.public.supabaseUrl || '').trim()
  const supabasePublishableKey = String(config.public.supabasePublishableKey || '').trim()

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error('Missing Supabase config. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env.')
  }

  assertSupabaseConfigMatches(supabaseUrl, supabasePublishableKey)

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
