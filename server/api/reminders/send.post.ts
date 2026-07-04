import { assertReminderCronAuthorized } from '../../utils/pushReminderAuth'
import { deliverReminderCandidates, loadReminderCandidates } from '../../utils/logReminderDelivery'
import { getSupabaseAdmin } from '../../utils/supabaseAdmin'
import { assertWebPushConfigured } from '../../utils/webPush'

export default defineEventHandler(async (event) => {
  assertReminderCronAuthorized(event)
  assertWebPushConfigured()

  const supabase = getSupabaseAdmin()
  const candidates = await loadReminderCandidates(supabase)
  const delivery = await deliverReminderCandidates(supabase, candidates)

  return {
    ok: true,
    candidateCount: candidates.length,
    sentCount: delivery.sentCount,
    failedCount: delivery.failedCount,
    disabledSubscriptionCount: delivery.disabledSubscriptionCount,
    results: delivery.results
  }
})
