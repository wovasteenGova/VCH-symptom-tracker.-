// https://nuxt.com/docs/api/configuration/nuxt-config
const isProduction = process.env.NODE_ENV === 'production'

function env(name: string) {
  return String(process.env[name] || '').trim()
}

const supabaseUrl = env('SUPABASE_URL')
  || env('NUXT_PUBLIC_SUPABASE_URL')

const supabaseAnonKey = env('SUPABASE_ANON_KEY')
  || env('SUPABASE_KEY')
  || env('NUXT_PUBLIC_SUPABASE_ANON_KEY')
  || env('NUXT_PUBLIC_SUPABASE_KEY')
  || env('NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')

const supabaseServiceKey = env('SUPABASE_SERVICE_KEY')
  || env('SUPABASE_SERVICE_ROLE_KEY')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  modules: ['@nuxt/ui', '@vite-pwa/nuxt', '@nuxtjs/supabase'],
  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },
  supabase: {
    redirect: false,
    url: supabaseUrl,
    key: supabaseAnonKey,
    serviceKey: supabaseServiceKey,
    cookieOptions: isProduction
      ? {
          domain: '.veteranscentralhub.us',
          secure: true,
          sameSite: 'lax'
        }
      : undefined
  },
  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    stripeProPriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    supabaseServiceRoleKey: supabaseServiceKey,
    supabaseServiceKey,
    public: {
      supabaseUrl,
      supabaseAnonKey: supabaseAnonKey,
      supabaseKey: supabaseAnonKey,
      supabasePublishableKey: supabaseAnonKey,
      stripePublishableKey: env('STRIPE_PUBLIC_KEY') || env('STRIPE_PUBLISHABLE_KEY') || env('NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
      siteUrl: env('APP_URL') || env('NUXT_PUBLIC_SITE_URL')
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
      start_url: '/app',
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
    '/app': { ssr: false },
    '/app/**': { ssr: false },
    '/profile': { ssr: false },
    '/auth/**': { ssr: false },
    '/upgrade': { ssr: false },
    '/upgrade/**': { ssr: false },
    '/api/stripe/webhook': { cors: false }
  }
})
