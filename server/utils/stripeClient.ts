import Stripe from 'stripe'
import { getRequestHost, getRequestProtocol } from 'h3'

export function getStripeClient() {
  const config = useRuntimeConfig()

  if (!config.stripeSecretKey) {
    throw createError({
      statusCode: 500,
      message: 'Stripe secret key is not configured.'
    })
  }

  return new Stripe(config.stripeSecretKey, {
    apiVersion: Stripe.API_VERSION
  })
}

export function getRequestBaseUrl(event: Parameters<typeof getRequestHost>[0]) {
  const config = useRuntimeConfig()
  const requestProtocol = getRequestProtocol(event, { xForwardedProto: true })
  const requestHost = getRequestHost(event, { xForwardedHost: true })
  const requestOrigin = requestProtocol && requestHost ? `${requestProtocol}://${requestHost}` : ''
  const configuredOrigin = config.public.siteUrl || 'http://localhost:3000'

  return requestOrigin || configuredOrigin
}
