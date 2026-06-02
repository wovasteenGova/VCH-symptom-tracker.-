// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      supabasePublishableKey: process.env.SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''
    }
  },
  app: {
    head: {
      title: 'Symptom Tracker',
      meta: [
        { name: 'description', content: 'A mobile-first symptom tracker for veterans.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#0f172a' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'Symptom Tracker' }
      ]
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Veteran Symptom Tracker',
      short_name: 'Symptoms',
      description: 'A mobile-first symptom tracker for veterans.',
      theme_color: '#0f172a',
      background_color: '#f8fafc',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/'
    }
  }
})
