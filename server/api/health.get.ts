import { getSupabaseConfigError, resolveSupabaseEnv } from '../utils/supabaseEnv'
import { getSupabasePublicConfig } from '../utils/supabasePublicConfig'

export default defineEventHandler(() => {
  const resolved = getSupabasePublicConfig()
  const env = resolveSupabaseEnv()
  const configError = getSupabaseConfigError({
    url: resolved.supabaseUrl || env.url,
    anonKey: resolved.supabaseKey || env.anonKey,
    serviceKey: env.serviceKey
  })

  return {
    ok: !configError,
    supabase: Boolean(resolved.supabaseUrl && resolved.supabaseKey),
    stripe: Boolean(useRuntimeConfig().stripeSecretKey && useRuntimeConfig().public.stripePublishableKey),
    message: configError || 'Ready'
  }
})
