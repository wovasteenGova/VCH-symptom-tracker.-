import { requireAuthUser } from '../../utils/authUser'

type ClaimBuilderEntitlementResponse = {
  entitled: boolean
  planId: string
  foundingPro: {
    source: string
    until: string
  } | null
}

const FALLBACK: ClaimBuilderEntitlementResponse = {
  entitled: false,
  planId: 'free',
  foundingPro: null
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const claimBuilderUrl = String(config.public.claimBuilderUrl || '').trim().replace(/\/$/, '')

  if (!claimBuilderUrl) {
    return FALLBACK
  }

  let accessToken = ''

  try {
    const auth = await requireAuthUser(event)
    accessToken = auth.accessToken
  } catch {
    return FALLBACK
  }

  try {
    return await $fetch<ClaimBuilderEntitlementResponse>(
      `${claimBuilderUrl}/api/billing/symptom-tracker-entitlement`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
  } catch {
    return FALLBACK
  }
})
