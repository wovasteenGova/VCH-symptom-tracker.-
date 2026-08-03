import { PRO_PRODUCT_KEY, canManageStripeBilling, BILLING_PORTAL_UNAVAILABLE_MESSAGE, NO_BILLING_PORTAL_MESSAGE } from '../../../app/utils/subscription'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { requireAuthUser } from '../../utils/authUser'
import { getRequestBaseUrl, getStripeClient } from '../../utils/stripeClient'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthUser(event)
  const stripe = getStripeClient()
  const supabase = getSupabaseAdmin()
  const baseUrl = getRequestBaseUrl(event)

  const { data: entitlement } = await supabase
    .from('user_entitlements')
    .select('stripe_customer_id, stripe_subscription_id, status')
    .eq('user_id', user.id)
    .eq('product_key', PRO_PRODUCT_KEY)
    .maybeSingle()

  if (!canManageStripeBilling(entitlement)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'No billing portal',
      message: NO_BILLING_PORTAL_MESSAGE
    })
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: entitlement!.stripe_customer_id!,
      return_url: `${baseUrl}/upgrade`
    })

    return { url: portalSession.url }
  } catch (error) {
    console.error('[stripe] billing portal session failed', {
      userId: user.id,
      message: error instanceof Error ? error.message : String(error)
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Billing portal unavailable',
      message: BILLING_PORTAL_UNAVAILABLE_MESSAGE
    })
  }
})
