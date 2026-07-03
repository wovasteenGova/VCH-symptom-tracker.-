import Stripe from 'stripe'
import { getHeader, readRawBody } from 'h3'
import { PRO_PRODUCT_KEY } from '../../../app/utils/subscription'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { getStripeClient } from '../../utils/stripeClient'

type EntitlementUpsert = {
  user_id: string
  product_key: string
  status: 'active' | 'canceled' | 'past_due' | 'comped'
  stripe_customer_id?: string | null
  stripe_subscription_id?: string | null
  stripe_price_id?: string | null
  current_period_end?: string | null
  unlocked_at?: string
}

function mapSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === 'active' || status === 'trialing') {
    return 'active' as const
  }

  if (status === 'past_due' || status === 'unpaid') {
    return 'past_due' as const
  }

  return 'canceled' as const
}

async function upsertEntitlement(payload: EntitlementUpsert) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('user_entitlements')
    .upsert({
      ...payload,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })

  if (error) {
    throw error
  }
}

async function syncSubscriptionEntitlement(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    return
  }

  const status = mapSubscriptionStatus(subscription.status)
  const priceId = subscription.items.data[0]?.price?.id || null
  const periodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null

  await upsertEntitlement({
    user_id: userId,
    product_key: subscription.metadata?.product_key || PRO_PRODUCT_KEY,
    status,
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    current_period_end: periodEnd,
    unlocked_at: new Date().toISOString()
  })
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id || session.client_reference_id

  if (!userId) {
    return
  }

  if (session.mode === 'subscription' && session.subscription) {
    const stripe = getStripeClient()
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    await syncSubscriptionEntitlement(subscription)
    return
  }

  await upsertEntitlement({
    user_id: userId,
    product_key: session.metadata?.product_key || PRO_PRODUCT_KEY,
    status: 'active',
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
    unlocked_at: new Date().toISOString()
  })
}

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
