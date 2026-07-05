import Stripe from 'stripe'
import { getHeader, readRawBody } from 'h3'
import { getStripeClient } from '../../utils/stripeClient'
import {
  handleCheckoutCompleted,
  syncSubscriptionEntitlement
} from '../../utils/stripeEntitlements'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.stripeWebhookSecret) {
    throw createError({
      statusCode: 500,
      message: 'Stripe webhook secret is not configured.'
    })
  }

  const stripe = getStripeClient()
  const signature = getHeader(event, 'stripe-signature')
  const rawBody = await readRawBody(event, 'utf8')

  if (!signature || !rawBody) {
    throw createError({
      statusCode: 400,
      message: 'Missing Stripe webhook payload.'
    })
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, signature, config.stripeWebhookSecret)
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : 'Invalid Stripe webhook signature.'
    })
  }

  try {
    switch (stripeEvent.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(stripeEvent.data.object as Stripe.Checkout.Session)
      break
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
      await syncSubscriptionEntitlement(stripeEvent.data.object as Stripe.Subscription)
      break
    case 'customer.subscription.deleted': {
      const subscription = stripeEvent.data.object as Stripe.Subscription
      await syncSubscriptionEntitlement(subscription)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = stripeEvent.data.object as Stripe.Invoice
      const subscriptionId = typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription?.id

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await syncSubscriptionEntitlement(subscription)
      }
      break
    }
    default:
      break
    }

    return { received: true }
  } catch (error) {
    console.error('[stripe webhook]', stripeEvent.type, error)

    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Stripe webhook handler failed.'
    })
  }
})
