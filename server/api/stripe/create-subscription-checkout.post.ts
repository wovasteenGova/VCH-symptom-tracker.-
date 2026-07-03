import Stripe from 'stripe'
import { PRO_ANNUAL_PRICE, PRO_PRODUCT_KEY } from '../../../app/utils/subscription'
import { requireAuthUser } from '../../utils/authUser'
import { getRequestBaseUrl, getStripeClient } from '../../utils/stripeClient'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { user } = await requireAuthUser(event)
  const stripe = getStripeClient()
  const baseUrl = getRequestBaseUrl(event)

  const amountInCents = Math.round(PRO_ANNUAL_PRICE * 100)
  const configuredPriceId = String(config.stripeProPriceId || '').trim()

  let lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]

  if (configuredPriceId) {
    lineItems = [{ price: configuredPriceId, quantity: 1 }]
  } else {
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: amountInCents,
      recurring: { interval: 'year' },
      product_data: {
        name: 'Symptom Tracker Pro',
        description: 'Unlimited entries, family reporting, and signed PDF exports for veterans.'
      }
    })

    lineItems = [{ price: price.id, quantity: 1 }]
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: lineItems,
    success_url: `${baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/upgrade?canceled=1`,
    customer_email: user.email || undefined,
    client_reference_id: user.id,
    metadata: {
      user_id: user.id,
      product_key: PRO_PRODUCT_KEY
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        product_key: PRO_PRODUCT_KEY
      }
    }
  })

  if (!session.url) {
    throw createError({
      statusCode: 500,
      message: 'Stripe did not return a checkout URL.'
    })
  }

  return { url: session.url }
})
