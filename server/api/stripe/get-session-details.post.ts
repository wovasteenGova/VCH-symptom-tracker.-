import { readBody } from 'h3'
import { requireAuthUser } from '../../utils/authUser'
import { getStripeClient } from '../../utils/stripeClient'

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthUser(event)

  const body = await readBody<{ sessionId?: string }>(event)
  const sessionId = String(body?.sessionId || '').trim()

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Session ID is required.'
    })
  }

  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription']
  })

  const sessionUserId = session.metadata?.user_id || session.client_reference_id

  if (sessionUserId !== user.id) {
    throw createError({
      statusCode: 403,
      message: 'This checkout session does not belong to your account.'
    })
  }

  return {
    id: session.id,
    amount: session.amount_total ? session.amount_total / 100 : null,
    currency: session.currency,
    paymentStatus: session.payment_status,
    status: session.status,
    mode: session.mode,
    customerEmail: session.customer_details?.email || null,
    metadata: session.metadata
  }
})
