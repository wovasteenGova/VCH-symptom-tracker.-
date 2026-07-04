import { TRACKER_PUBLIC_ORIGIN } from './reportBranding'

function isLocalOrigin(value: string) {
  try {
    const hostname = new URL(value).hostname
    return hostname === 'localhost'
      || hostname === '127.0.0.1'
      || hostname.endsWith('.local')
  } catch {
    return false
  }
}

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, '')
}

export function resolveAuthSiteOrigin(configuredSiteUrl?: string | null) {
  const configured = configuredSiteUrl?.trim()

  if (import.meta.client) {
    if (configured && !isLocalOrigin(configured)) {
      return stripTrailingSlash(configured)
    }

    const origin = stripTrailingSlash(window.location.origin)

    // Auth emails must never point at localhost in production builds.
    if (isLocalOrigin(origin)) {
      return TRACKER_PUBLIC_ORIGIN
    }

    return origin
  }

  if (configured && !isLocalOrigin(configured)) {
    return stripTrailingSlash(configured)
  }

  return TRACKER_PUBLIC_ORIGIN
}

export function resolveAuthRedirectUrl(path: string, configuredSiteUrl?: string | null) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${resolveAuthSiteOrigin(configuredSiteUrl)}${normalizedPath}`
}

/** OAuth callback must stay on the same origin where sign-in started (PKCE verifier). */
export function resolveOAuthCallbackUrl(configuredSiteUrl?: string | null) {
  if (import.meta.client) {
    return `${stripTrailingSlash(window.location.origin)}/auth/callback`
  }

  return resolveAuthRedirectUrl('/auth/callback', configuredSiteUrl)
}

export function useTrackerAuthRedirects() {
  const config = useRuntimeConfig()
  const configuredSiteUrl = String(config.public.siteUrl || '')

  return {
    siteOrigin: () => resolveAuthSiteOrigin(configuredSiteUrl),
    confirmUrl: () => resolveAuthRedirectUrl('/auth/confirm', configuredSiteUrl),
    resetPasswordUrl: () => resolveAuthRedirectUrl('/auth/reset-password', configuredSiteUrl),
    callbackUrl: () => resolveOAuthCallbackUrl(configuredSiteUrl)
  }
}
