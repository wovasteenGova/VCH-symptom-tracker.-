import Stripe from 'stripe'
import { readBody } from 'h3'
import { requireAuthUser } from '../../utils/authUser'
import { getRequestBaseUrl, getStripeClient } from '../../utils/stripeClient'
import {
  buildSubscriptionCheckoutParams,
  buildSubscriptionLineItems
} from '../../utils/subscriptionCheckoutSession'

function logCheckout(step: string, details: Record<string, unknown> = {}) {
  console.info(`[stripe checkout] ${step}`, details)
}

function logCheckoutError(step: string, details: Record<string, unknown> = {}) {
  console.error(`[stripe checkout] ${step}`, details)
}

export default defineEventHandler(async (event) => {
  const requestId = crypto.randomUUID()
  const config = useRuntimeConfig()
  const body = await readBody<{ embedded?: boolean }>(event).catch(() => ({}))
  const embedded = body?.embedded === true

  logCheckout('request received', {
    requestId,
    embedded,
    hasStripeSecretKey: Boolean(config.stripeSecretKey),
    hasProPriceId: Boolean(config.stripeProPriceId),
    origin: getRequestHeader(event, 'origin') || null
  })

  if (!config.stripeSecretKey) {
    logCheckoutError('missing stripe secret key', { requestId })
    throw createError({
      statusCode: 500,
      message: 'Stripe secret key is not configured.'
    })
  }

  let user

  try {
    const authResult = await requireAuthUser(event)
    user = authResult.user
    logCheckout('auth ok', {
      requestId,
      userId: user.id,
      email: user.email
    })
  } catch (error) {
    logCheckoutError('auth failed', {
      requestId,
      message: error instanceof Error ? error.message : String(error)
    })
    throw error
  }

  const stripe = getStripeClient()
  const baseUrl = getRequestBaseUrl(event)
  const configuredPriceId = String(config.stripeProPriceId || '').trim()
  const lineItems = buildSubscriptionLineItems(configuredPriceId)

  logCheckout('creating session', {
    requestId,
    baseUrl,
    embedded,
    usingConfiguredPriceId: Boolean(configuredPriceId)
  })

  try {
    const session = await stripe.checkout.sessions.create(
      buildSubscriptionCheckoutParams({
        user,
        baseUrl,
        lineItems,
        embedded
      })
    )

    if (embedded) {
      if (!session.client_secret) {
        logCheckoutError('stripe returned no client secret', {
          requestId,
          sessionId: session.id
        })
        throw createError({
          statusCode: 500,
          message: 'Stripe did not return an embedded checkout secret.'
        })
      }

      logCheckout('embedded session created', {
        requestId,
        sessionId: session.id
      })

      return {
        clientSecret: session.client_secret,
        sessionId: session.id
      }
    }

    if (!session.url) {
      logCheckoutError('stripe returned no checkout url', {
        requestId,
        sessionId: session.id
      })
      throw createError({
        statusCode: 500,
        message: 'Stripe did not return a checkout URL.'
      })
    }

    logCheckout('redirect session created', {
      requestId,
      sessionId: session.id,
      checkoutUrlPreview: `${session.url.slice(0, 48)}...`
    })

    return { url: session.url }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    if (error instanceof Stripe.errors.StripeError) {
      logCheckoutError('stripe api error', {
        requestId,
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode
      })

      throw createError({
        statusCode: error.statusCode || 500,
        message: `${error.message}${error.code ? ` (${error.code})` : ''}`
      })
    }

    const message = error instanceof Error ? error.message : 'Stripe checkout failed.'
    logCheckoutError('unexpected error', {
      requestId,
      message
    })

    throw createError({
      statusCode: 500,
      message
    })
  }
})
