export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    hasSecretKey: Boolean(config.stripeSecretKey),
    hasPublishableKey: Boolean(config.public.stripePublishableKey),
    hasWebhookSecret: Boolean(config.stripeWebhookSecret),
    hasProPriceId: Boolean(config.stripeProPriceId),
    secretKeyPreview: config.stripeSecretKey ? `${config.stripeSecretKey.slice(0, 12)}...` : null,
    publishableKeyPreview: config.public.stripePublishableKey
      ? `${config.public.stripePublishableKey.slice(0, 12)}...`
      : null,
    isTestMode: config.stripeSecretKey?.startsWith('sk_test_') ?? false,
    productKey: 'symptom_tracker_pro',
    webhookPath: '/api/stripe/webhook',
    environment: process.env.NODE_ENV || 'development'
  }
})
