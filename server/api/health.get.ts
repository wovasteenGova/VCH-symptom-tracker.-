import { getSupabaseConfigError, resolveSupabaseEnv } from '../utils/supabaseEnv'
import { getSupabasePublicConfig } from '../utils/supabasePublicConfig'

export default defineEventHandler(() => {
  const resolved = getSupabasePublicConfig()
  const env = resolveSupabaseEnv()
  const config = useRuntimeConfig()
  const configError = getSupabaseConfigError({
    url: resolved.supabaseUrl || env.url,
    anonKey: resolved.supabaseKey || env.anonKey,
    serviceKey: env.serviceKey
  })

  const stripeConfigured = Boolean(
    config.stripeSecretKey && config.public.stripePublishableKey
  )
  const checkoutReady = Boolean(
    stripeConfigured
    && config.stripeWebhookSecret
    && config.stripeProPriceId
    && env.serviceKey
  )

  return {
    ok: !configError && stripeConfigured,
    supabase: Boolean(resolved.supabaseUrl && resolved.supabaseKey),
    stripe: stripeConfigured,
    checkoutReady,
    checkout: {
      hasWebhookSecret: Boolean(config.stripeWebhookSecret),
      hasProPriceId: Boolean(config.stripeProPriceId),
      hasServiceKey: Boolean(env.serviceKey),
      siteUrl: config.public.siteUrl || null
    },
    message: configError
      || (checkoutReady ? 'Checkout ready' : 'Stripe keys set; add webhook secret + service key for Pro unlock')
  }
})
