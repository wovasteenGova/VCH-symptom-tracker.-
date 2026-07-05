export const PRO_PRODUCT_KEY = 'symptom_tracker_pro'
export const FREE_CONDITION_LIMIT = 1
/** @deprecated Use FREE_CONDITION_LIMIT */
export const FREE_ENTRY_LIMIT = FREE_CONDITION_LIMIT
export const PRO_ANNUAL_PRICE = 14.99
export const PRO_ANNUAL_PRICE_LABEL = '$14.99/year'
export const PRO_ANNUAL_PRICE_DETAIL = 'About $1.25/month, billed once per year'
export const PRO_REFUND_POLICY_SHORT = '14-day refund'
export const PRO_REFUND_POLICY =
  '14-day refund — email support@veteranscentralhub.com within 14 days of purchase if Pro is not right for you.'
export const PRO_CHECKOUT_SUBMIT_MESSAGE =
  '$14.99/year · 14-day refund — contact support within 14 days of purchase for a refund.'

/** @deprecated Use PRO_ANNUAL_PRICE */
export const PRO_MONTHLY_PRICE = PRO_ANNUAL_PRICE
/** @deprecated Use PRO_ANNUAL_PRICE_LABEL */
export const PRO_MONTHLY_PRICE_LABEL = PRO_ANNUAL_PRICE_LABEL

export const VCH_HUB_URL = 'https://veteranscentralhub.us'
export const VCH_PRIVACY_URL = `${VCH_HUB_URL}/privacy`
export const VCH_TERMS_URL = `${VCH_HUB_URL}/terms`
export const VCH_CONTACT_URL = 'https://veteranscentralhub.us/contact'
export const VCH_CLAIM_MAKER_URL = 'https://veteranscentralhub.us/claims-maker'

export const WHY_WE_CHARGE_COPY =
  'Pro subscriptions help fund our upcoming VCH Claim Maker — a separate tool for organizing service history, symptoms, and claim evidence into a stronger first draft. It is not live yet. This is a self-funded build, so symptom tracker Pro helps cover servers and development until Claim Maker ships.'

export const FREE_TIER_FEATURES = [
  'Pick 1 condition to track',
  'Unlimited entries within that condition',
  'Calendar logging charts and entry PDFs with weekly symptom counts'
] as const

export const PRO_TIER_FEATURES = [
  'Unlimited conditions',
  'Family reporting links for supporters',
  'Severity trends, functional impact, and advanced charts in PDF exports',
  'Personal review summaries with topics pulled from your logs'
] as const

export function conditionKeyFromLabel(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

export function formatConditionKeyLabel(conditionKey: string) {
  return conditionKey
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function isActiveEntitlementStatus(status: string | null | undefined) {
  return status === 'active' || status === 'comped'
}

export function buildSupportEmailHref(subject = 'Symptom Tracker — free Pro access request') {
  return `mailto:support@veteranscentralhub.com?subject=${encodeURIComponent(subject)}`
}
