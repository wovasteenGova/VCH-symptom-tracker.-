import {
  getSupabaseConfigError,
  patchSupabaseRuntimeConfig,
  resolveSupabaseEnv
} from '../utils/supabaseEnv'

export default defineNitroPlugin((nitroApp) => {
  const config = useRuntimeConfig()
  patchSupabaseRuntimeConfig(config.public as Parameters<typeof patchSupabaseRuntimeConfig>[0])

  const env = resolveSupabaseEnv()
  const configError = getSupabaseConfigError(env)

  if (configError) {
    console.error('[supabase-env]', configError)
  } else {
    console.info('[supabase-env] Supabase URL and anon key resolved for server runtime.')
  }

  nitroApp.hooks.hook('request', (event) => {
    const requestConfig = useRuntimeConfig(event)
    patchSupabaseRuntimeConfig(requestConfig.public as Parameters<typeof patchSupabaseRuntimeConfig>[0])
  })
})
