import { getSupabasePublicConfig, inspectSupabaseKey, previewSupabaseKey } from '../utils/supabasePublicConfig'

function extractSupabaseProjectRef(url: string) {
  const match = String(url || '').match(/https:\/\/([^.]+)\.supabase\.co/)
  return match?.[1] || null
}

export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  const moduleConfig = config.public.supabase as { url?: string, key?: string } | undefined
  const resolved = getSupabasePublicConfig()
  const moduleUrl = String(moduleConfig?.url || '').trim()
  const moduleKey = String(moduleConfig?.key || '').trim()
  const runtimeUrl = String(config.public.supabaseUrl || '').trim()
  const runtimeKey = String(
    config.public.supabaseAnonKey || config.public.supabasePublishableKey || ''
  ).trim()
  const resolvedKeyInfo = inspectSupabaseKey(resolved.supabaseKey)
  const serviceKey = String(config.supabaseServiceRoleKey || config.supabaseServiceKey || '').trim()
  const serviceKeyInfo = inspectSupabaseKey(serviceKey)
  const anonKeyLooksLikeServiceRole = resolvedKeyInfo.role === 'service_role'
  const anonKeySameAsServiceKey = Boolean(
    resolved.supabaseKey && serviceKey && resolved.supabaseKey === serviceKey
  )

  return {
    supabaseProjectRef: extractSupabaseProjectRef(resolved.supabaseUrl),
    expectedSupabaseProjectRef: 'bszlmqdqrwqocoxbzpyh',
    supabaseMatchesVch: extractSupabaseProjectRef(resolved.supabaseUrl) === 'bszlmqdqrwqocoxbzpyh',
    supabaseKeySource: resolved.source,
    moduleKeyMatchesRuntimeKey: Boolean(moduleKey && runtimeKey && moduleKey === runtimeKey),
    hasModuleSupabaseUrl: Boolean(moduleUrl),
    hasModuleSupabaseKey: Boolean(moduleKey),
    hasRuntimeSupabaseUrl: Boolean(runtimeUrl),
    hasRuntimeSupabaseAnonKey: Boolean(runtimeKey),
    moduleKeyPreview: previewSupabaseKey(moduleKey),
    runtimeKeyPreview: previewSupabaseKey(runtimeKey),
    resolvedKeyPreview: previewSupabaseKey(resolved.supabaseKey),
    resolvedKeyFormat: resolvedKeyInfo.format,
    resolvedKeyRole: resolvedKeyInfo.role,
    anonKeyLooksLikeServiceRole,
    anonKeySameAsServiceKey,
    serviceKeyPreview: previewSupabaseKey(serviceKey),
    serviceKeyRole: serviceKeyInfo.role,
    hasSupabaseServiceKey: Boolean(serviceKey),
    stripe: {
      hasSecretKey: Boolean(config.stripeSecretKey),
      hasPublishableKey: Boolean(config.public.stripePublishableKey),
      hasWebhookSecret: Boolean(config.stripeWebhookSecret),
      hasProPriceId: Boolean(config.stripeProPriceId),
      isTestMode: config.stripeSecretKey?.startsWith('sk_test_') ?? false
    },
    environment: process.env.NODE_ENV || 'development',
    fixHint: anonKeyLooksLikeServiceRole || anonKeySameAsServiceKey
      ? 'SUPABASE_ANON_KEY is set to the service_role key. Copy the anon/publishable key from VCH .env (starts with sb_publishable_ or legacy anon JWT), not SUPABASE_SERVICE_KEY.'
      : 'Copy SUPABASE_URL and SUPABASE_ANON_KEY from VCH .env into Symptom_tracker/.env, then restart dev server.'
  }
})
