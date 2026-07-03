import { readBody } from 'h3'
import { requireAuthUser } from '../../utils/authUser'
import { getStripeClient } from '../../utils/stripeClient'
import { handleCheckoutCompleted } from '../../utils/stripeEntitlements'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthUser(event)
  const body = await readBody<{ sessionId?: string }>(event)
  const sessionId = String(body?.sessionId || '').trim()

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Checkout session ID is required.'
    })
  }

  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId)

  const sessionUserId = session.metadata?.user_id || session.client_reference_id

  if (sessionUserId !== user.id) {
    throw createError({
      statusCode: 403,
      message: 'This checkout session does not belong to your account.'
    })
  }

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    throw createError({
      statusCode: 400,
      message: 'Payment is still processing. Try again in a few seconds.'
    })
  }

  const activated = await handleCheckoutCompleted(session)

  return {
    activated,
    paymentStatus: session.payment_status,
    mode: session.mode
  }
})
