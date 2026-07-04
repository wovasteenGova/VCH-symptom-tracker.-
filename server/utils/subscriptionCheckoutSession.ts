import type Stripe from 'stripe'
import { PRO_MONTHLY_PRICE, PRO_PRODUCT_KEY } from '../../app/utils/subscription'

type CheckoutUser = {
  id: string
  email?: string | null
}

export function buildSubscriptionLineItems(
  configuredPriceId: string
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  if (configuredPriceId) {
    return [{ price: configuredPriceId, quantity: 1 }]
  }

  const amountInCents = Math.round(PRO_MONTHLY_PRICE * 100)

  return [{
    price_data: {
      currency: 'usd',
      unit_amount: amountInCents,
      recurring: { interval: 'month' },
      product_data: {
        name: 'Symptom Tracker Pro',
        description: 'Unlimited entries, family reporting, and signed PDF exports for veterans.',
        metadata: {
          product_key: PRO_PRODUCT_KEY,
          app: 'symptom_tracker'
        }
      }
    },
    quantity: 1
  }]
}

export function buildSubscriptionCheckoutParams(options: {
  user: CheckoutUser
  baseUrl: string
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
  embedded?: boolean
}): Stripe.Checkout.SessionCreateParams {
  const shared = {
    mode: 'subscription' as const,
    line_items: options.lineItems,
    customer_email: options.user.email || undefined,
    client_reference_id: options.user.id,
    metadata: {
      user_id: options.user.id,
      product_key: PRO_PRODUCT_KEY
    },
    subscription_data: {
      metadata: {
        user_id: options.user.id,
        product_key: PRO_PRODUCT_KEY
      }
    }
  }

  if (options.embedded) {
    return {
      ...shared,
      ui_mode: 'embedded_page',
      return_url: `${options.baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`
    }
  }

  return {
    ...shared,
    success_url: `${options.baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${options.baseUrl}/upgrade?canceled=1`
  }
}
