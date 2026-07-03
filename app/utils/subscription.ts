export const PRO_PRODUCT_KEY = 'symptom_tracker_pro'
export const FREE_ENTRY_LIMIT = 2
export const PRO_ANNUAL_PRICE = 12.99
export const PRO_ANNUAL_PRICE_LABEL = '$12.99/year'
export const VCH_HUB_URL = 'https://veteranscentralhub.us'
export const VCH_CONTACT_URL = 'https://veteranscentralhub.us/contact'
export const VCH_CLAIM_MAKER_URL = 'https://veteranscentralhub.us/claims-maker'

export const WHY_WE_CHARGE_COPY =
  'Pro subscriptions help fund our upcoming VCH Claim Maker — a separate tool for organizing service history, symptoms, and claim evidence into a stronger first draft. It is not live yet. This is a self-funded build, so symptom tracker Pro helps cover servers and development until Claim Maker ships.'

export const FREE_TIER_FEATURES = [
  'Up to 2 symptom entries',
  'Basic history and editing',
  'Sign in and sync across devices'
] as const

export const PRO_TIER_FEATURES = [
  'Unlimited symptom entries',
  'Family reporting links for supporters',
  'Signed PDF exports for claims evidence',
  'Priority access to new VA-informed fields'
] as const

export function isActiveEntitlementStatus(status: string | null | undefined) {
  return status === 'active' || status === 'comped'
}

export function buildSupportEmailHref(subject = 'Symptom Tracker — free Pro access request') {
  return `mailto:support@veteranscentralhub.com?subject=${encodeURIComponent(subject)}`
}
