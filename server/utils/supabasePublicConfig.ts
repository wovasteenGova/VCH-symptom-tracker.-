import type { H3Event } from 'h3'

import {
  getSupabaseConfigError,
  patchSupabaseRuntimeConfig,
  resolveSupabaseEnv
} from './supabaseEnv'

type SupabasePublicConfig = {
  supabaseUrl: string
  supabaseKey: string
  source: 'module' | 'runtime' | 'env' | 'missing'
}

export function getSupabasePublicConfig(event?: H3Event): SupabasePublicConfig {
  const config = event ? useRuntimeConfig(event) : useRuntimeConfig()
  patchSupabaseRuntimeConfig(config.public as Parameters<typeof patchSupabaseRuntimeConfig>[0])

  const moduleConfig = config.public.supabase as { url?: string, key?: string } | undefined
  const moduleUrl = String(moduleConfig?.url || '').trim()
  const moduleKey = String(moduleConfig?.key || '').trim()
  const runtimeUrl = String(config.public.supabaseUrl || '').trim()
  const runtimeKey = String(
    config.public.supabaseAnonKey || config.public.supabasePublishableKey || config.public.supabaseKey || ''
  ).trim()
  const envConfig = resolveSupabaseEnv()

  if (moduleUrl && moduleKey) {
    return {
      supabaseUrl: moduleUrl,
      supabaseKey: moduleKey,
      source: 'module'
    }
  }

  if (runtimeUrl && runtimeKey) {
    return {
      supabaseUrl: runtimeUrl,
      supabaseKey: runtimeKey,
      source: 'runtime'
    }
  }

  if (envConfig.url && envConfig.anonKey) {
    return {
      supabaseUrl: envConfig.url,
      supabaseKey: envConfig.anonKey,
      source: 'env'
    }
  }

  return {
    supabaseUrl: moduleUrl || runtimeUrl || envConfig.url,
    supabaseKey: moduleKey || runtimeKey || envConfig.anonKey,
    source: 'missing'
  }
}

export function assertSupabasePublicConfig(event?: H3Event) {
  const resolved = getSupabasePublicConfig(event)
  const configError = getSupabaseConfigError({
    url: resolved.supabaseUrl,
    anonKey: resolved.supabaseKey,
    serviceKey: ''
  })

  if (configError) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Service Unavailable',
      message: configError
    })
  }

  return resolved
}

export function previewSupabaseKey(key: string) {
  if (!key) {
    return null
  }

  if (key.startsWith('sb_publishable_')) {
    return `sb_publishable_...${key.slice(-8)}`
  }

  return `${key.slice(0, 16)}...${key.slice(-8)}`
}

export function inspectSupabaseKey(key: string) {
  if (!key) {
    return {
      format: 'missing' as const,
      role: null,
      projectRef: null
    }
  }

  if (key.startsWith('sb_publishable_')) {
    return {
      format: 'publishable' as const,
      role: 'anon',
      projectRef: null
    }
  }

  const parts = key.split('.')

  if (parts.length !== 3) {
    return {
      format: 'unknown' as const,
      role: null,
      projectRef: null
    }
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as {
      role?: string
      ref?: string
    }

    return {
      format: 'legacy_jwt' as const,
      role: payload.role || null,
      projectRef: payload.ref || null
    }
  } catch {
    return {
      format: 'unknown' as const,
      role: null,
      projectRef: null
    }
  }
}
