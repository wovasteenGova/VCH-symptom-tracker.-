import type Stripe from 'stripe'
import { PRO_ANNUAL_PRICE, PRO_CHECKOUT_SUBMIT_MESSAGE, PRO_PRODUCT_KEY } from '../../app/utils/subscription'

type CheckoutUser = {
  id: string
  email?: string | null
}

export function buildSubscriptionLineItems(
  configuredPriceId: string
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  if (isStripePriceId(configuredPriceId)) {
    return [{ price: configuredPriceId, quantity: 1 }]
  }

  // Caller must create a Stripe Price first when no catalog price is configured (see VCH create-payment.ts).
  return []
}

export async function resolveSubscriptionLineItems(
  stripe: Stripe,
  configuredPriceId: string
): Promise<Stripe.Checkout.SessionCreateParams.LineItem[]> {
  if (isStripePriceId(configuredPriceId)) {
    return [{ price: configuredPriceId, quantity: 1 }]
  }

  const amountInCents = Math.round(PRO_ANNUAL_PRICE * 100)
  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: amountInCents,
    recurring: { interval: 'year' },
    product_data: {
      name: 'Symptom Tracker Pro',
      metadata: {
        product_key: PRO_PRODUCT_KEY,
        app: 'symptom_tracker'
      }
    }
  })

  return [{ price: price.id, quantity: 1 }]
}

export function isStripePriceId(value: string) {
  return /^price_[A-Za-z0-9]+$/.test(String(value || '').trim())
}

export function buildSubscriptionCheckoutParams(options: {
  user: CheckoutUser
  baseUrl: string
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[]
  embedded?: boolean
}): Stripe.Checkout.SessionCreateParams {
  const shared = {
    mode: 'subscription' as const,
    payment_method_types: ['card'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
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
    },
    custom_text: {
      submit: {
        message: PRO_CHECKOUT_SUBMIT_MESSAGE
      }
    }
  }

  if (options.embedded) {
    return {
      ...shared,
      ui_mode: 'embedded',
      return_url: `${options.baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`
    }
  }

  return {
    ...shared,
    success_url: `${options.baseUrl}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${options.baseUrl}/upgrade?canceled=1`
  }
}
