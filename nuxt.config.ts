// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },
  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabasePublishableKey: process.env.SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
      stripePublishableKey: process.env.STRIPE_PUBLIC_KEY || process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      siteUrl: process.env.APP_URL || process.env.NUXT_PUBLIC_SITE_URL || ''
    }
  },
  app: {
    head: {
      title: 'Veteran Symptom Tracker',
      meta: [
        { name: 'description', content: 'A mobile-first symptom tracker for veterans to log symptoms, track daily impact, and collect supporter observations.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'Symptoms' },
        { property: 'og:title', content: 'Veteran Symptom Tracker' },
        { property: 'og:description', content: 'Track symptoms, daily impact, and signed supporter observations from your phone.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: '/vch-logo.png' },
        { name: 'twitter:card', content: 'summary' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/vch-logo.png' },
        { rel: 'shortcut icon', type: 'image/png', href: '/vch-logo.png' },
        { rel: 'apple-touch-icon', href: '/vch-logo.png' }
      ]
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    includeAssets: ['vch-logo.png', 'apple-touch-icon.png', 'pwa-192.png', 'pwa-512.png'],
    manifest: {
      name: 'Veteran Symptom Tracker',
      short_name: 'Symptoms',
      description: 'A mobile-first symptom tracker for veterans to log symptoms and supporter observations.',
      theme_color: '#0f172a',
      background_color: '#020617',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: '/vch-logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/vch-logo.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable'
        }
      ],
      categories: ['health', 'productivity', 'utilities'],
      screenshots: [
        {
          src: '/vch-logo.png',
          sizes: '512x512',
          type: 'image/png',
          form_factor: 'narrow'
        }
      ]
    }
  },
  nitro: {
    preset: 'netlify',
    compatibilityDate: '2025-07-15',
    compressPublicAssets: true
  },
  routeRules: {
    '/upgrade': { ssr: false },
    '/upgrade/**': { ssr: false }
  }
})
