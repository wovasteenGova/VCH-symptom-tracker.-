import Stripe from 'stripe'
import { PRO_PRODUCT_KEY, isActiveEntitlementStatus } from '../../../app/utils/subscription'
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
    .select('stripe_customer_id, status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!entitlement?.stripe_customer_id || !isActiveEntitlementStatus(entitlement.status)) {
    throw createError({
      statusCode: 400,
      message: 'No active subscription found to manage.'
    })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: entitlement.stripe_customer_id,
    return_url: `${baseUrl}/upgrade`
  })

  return { url: portalSession.url }
})
