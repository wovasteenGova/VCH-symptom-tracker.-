import Stripe from 'stripe'
import { getHeader, getRequestHost, getRequestProtocol } from 'h3'

export function getStripeClient() {
  const config = useRuntimeConfig()

  if (!config.stripeSecretKey) {
    throw createError({
      statusCode: 500,
      message: 'Stripe secret key is not configured.'
    })
  }

  return new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })
}

export function getRequestBaseUrl(event: Parameters<typeof getRequestHost>[0]) {
  const config = useRuntimeConfig()
  const configuredOrigin = String(config.public.siteUrl || '').trim().replace(/\/$/, '')
  const isProduction = process.env.NODE_ENV === 'production'

  if (isProduction && configuredOrigin) {
    return configuredOrigin
  }

  const originHeader = getHeader(event, 'origin')?.trim()

  if (originHeader && /^https?:\/\//i.test(originHeader)) {
    return originHeader.replace(/\/$/, '')
  }

  const referer = getHeader(event, 'referer')?.trim()

  if (referer) {
    try {
      return new URL(referer).origin
    } catch {
      // Ignore malformed referer values.
    }
  }

  const requestProtocol = getRequestProtocol(event, { xForwardedProto: true })
  const requestHost = getRequestHost(event, { xForwardedHost: true })
  const requestOrigin = requestProtocol && requestHost ? `${requestProtocol}://${requestHost}` : ''

  if (requestOrigin) {
    return requestOrigin
  }

  if (configuredOrigin) {
    return configuredOrigin
  }

  return 'http://localhost:3000'
}
