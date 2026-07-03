import type Stripe from 'stripe'
import { PRO_PRODUCT_KEY } from '../../app/utils/subscription'
import { getSupabaseAdmin } from './supabaseAdmin'
import { getStripeClient } from './stripeClient'

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

export function mapSubscriptionStatus(status: Stripe.Subscription.Status) {
  if (status === 'active' || status === 'trialing') {
    return 'active' as const
  }

  if (status === 'past_due' || status === 'unpaid') {
    return 'past_due' as const
  }

  return 'canceled' as const
}

export async function upsertEntitlement(payload: EntitlementUpsert) {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('user_entitlements')
    .upsert({
      ...payload,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,product_key'
    })

  if (error) {
    throw error
  }
}

export async function syncSubscriptionEntitlement(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id

  if (!userId) {
    return false
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

  return true
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id || session.client_reference_id

  if (!userId) {
    return false
  }

  if (session.mode === 'subscription' && session.subscription) {
    const stripe = getStripeClient()
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription.id
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return syncSubscriptionEntitlement(subscription)
  }

  await upsertEntitlement({
    user_id: userId,
    product_key: session.metadata?.product_key || PRO_PRODUCT_KEY,
    status: 'active',
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id || null,
    unlocked_at: new Date().toISOString()
  })

  return true
}
