import Stripe from 'stripe'
import { getHeader, readRawBody } from 'h3'
import { PRO_PRODUCT_KEY } from '../../../app/utils/subscription'
import { getStripeClient } from '../../utils/stripeClient'
import {
  handleCheckoutCompleted,
  syncSubscriptionEntitlement,
  upsertEntitlement
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
      const userId = subscription.metadata?.user_id

      if (userId) {
        await upsertEntitlement({
          user_id: userId,
          product_key: subscription.metadata?.product_key || PRO_PRODUCT_KEY,
          status: 'canceled',
          stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null,
          stripe_subscription_id: subscription.id,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null
        })
      }
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
})
