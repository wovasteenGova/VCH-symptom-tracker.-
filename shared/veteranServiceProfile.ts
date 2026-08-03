export type VeteranServiceProfile = {
  phone: string | null
  date_of_birth: string | null
  service_branch: string | null
  service_rank: string | null
  service_start_year: number | null
  service_end_year: number | null
}

export type VeteranAccountProfile = VeteranServiceProfile & {
  full_name: string | null
}

export const EMPTY_VETERAN_SERVICE_PROFILE: VeteranServiceProfile = {
  phone: null,
  date_of_birth: null,
  service_branch: null,
  service_rank: null,
  service_start_year: null,
  service_end_year: null
}

export const SERVICE_BRANCH_OPTIONS = [
  { label: 'U.S. Army', value: 'U.S. Army' },
  { label: 'U.S. Navy', value: 'U.S. Navy' },
  { label: 'U.S. Air Force', value: 'U.S. Air Force' },
  { label: 'U.S. Marine Corps', value: 'U.S. Marine Corps' },
  { label: 'U.S. Space Force', value: 'U.S. Space Force' },
  { label: 'U.S. Coast Guard', value: 'U.S. Coast Guard' },
  { label: 'Army National Guard', value: 'Army National Guard' },
  { label: 'Air National Guard', value: 'Air National Guard' },
  { label: 'Other', value: 'Other' }
] as const

const SERVICE_YEAR_MIN = 1940
const SERVICE_YEAR_MAX = 2100
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function normalizeOptionalText(raw: unknown, maxLength: number) {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

function normalizeServiceYear(raw: unknown) {
  if (raw === null || raw === undefined || raw === '') return null
  const parsed = typeof raw === 'number' ? raw : Number.parseInt(String(raw), 10)
  if (!Number.isFinite(parsed)) return undefined
  const year = Math.trunc(parsed)
  if (year < SERVICE_YEAR_MIN || year > SERVICE_YEAR_MAX) return undefined
  return year
}

function normalizeDateOfBirth(raw: unknown) {
  if (raw === null || raw === undefined) return null
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  if (!trimmed) return null
  const isoDate = trimmed.slice(0, 10)
  if (!ISO_DATE.test(isoDate)) return undefined
  const date = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(date.getTime())) return undefined
  return isoDate
}

function normalizeServiceBranch(raw: unknown) {
  const text = normalizeOptionalText(raw, 80)
  if (text === undefined) return undefined
  if (!text) return null
  const allowed = SERVICE_BRANCH_OPTIONS.some(option => option.value === text)
  return allowed ? text : text.slice(0, 80)
}

export function normalizeVeteranServiceProfilePatch(raw: Record<string, unknown>) {
  const patch: Partial<VeteranServiceProfile> = {}

  if ('date_of_birth' in raw) {
    const value = normalizeDateOfBirth(raw.date_of_birth)
    if (value === undefined) return { error: 'Enter a valid date of birth.' as const }
    patch.date_of_birth = value
  }

  if ('phone' in raw) {
    const value = normalizeOptionalText(raw.phone, 40)
    if (value === undefined) return { error: 'Enter a valid phone number.' as const }
    patch.phone = value
  }

  if ('service_branch' in raw) {
    const value = normalizeServiceBranch(raw.service_branch)
    if (value === undefined) return { error: 'Enter a valid branch of service.' as const }
    patch.service_branch = value
  }

  if ('service_rank' in raw) {
    const value = normalizeOptionalText(raw.service_rank, 80)
    if (value === undefined) return { error: 'Enter a valid rank.' as const }
    patch.service_rank = value
  }

  if ('service_start_year' in raw) {
    const value = normalizeServiceYear(raw.service_start_year)
    if (value === undefined) return { error: 'Enter a valid year in.' as const }
    patch.service_start_year = value
  }

  if ('service_end_year' in raw) {
    const value = normalizeServiceYear(raw.service_end_year)
    if (value === undefined) return { error: 'Enter a valid year out.' as const }
    patch.service_end_year = value
  }

  const start = patch.service_start_year
  const end = patch.service_end_year
  if (start != null && end != null && end < start) {
    return { error: 'Year out must be the same as or after year in.' as const }
  }

  return { patch }
}

export function validateServiceYearRange(
  start: number | null | undefined,
  end: number | null | undefined
) {
  if (start != null && end != null && end < start) {
    return 'Year out must be the same as or after year in.'
  }
  return null
}

export function formatVeteranServiceProfileSummary(profile: VeteranServiceProfile) {
  const parts: string[] = []
  if (profile.service_branch) parts.push(profile.service_branch)
  if (profile.service_rank) parts.push(profile.service_rank)
  if (profile.service_start_year && profile.service_end_year) {
    parts.push(`${profile.service_start_year}–${profile.service_end_year}`)
  } else if (profile.service_start_year) {
    parts.push(`In ${profile.service_start_year}`)
  } else if (profile.service_end_year) {
    parts.push(`Out ${profile.service_end_year}`)
  }
  if (profile.date_of_birth) {
    const [year, month, day] = profile.date_of_birth.split('-')
    if (year && month && day) parts.push(`DOB ${month}/${day}/${year}`)
  }
  return parts.join(' · ')
}

export function hasVeteranServiceProfileDetails(profile: VeteranServiceProfile) {
  return Boolean(
    profile.phone
    || profile.date_of_birth
    || profile.service_branch
    || profile.service_rank
    || profile.service_start_year
    || profile.service_end_year
  )
}

export function readVeteranServiceProfileFromRow(row: Record<string, unknown> | null | undefined): VeteranServiceProfile {
  if (!row) return { ...EMPTY_VETERAN_SERVICE_PROFILE }

  const dobRaw = row.date_of_birth
  let date_of_birth: string | null = null
  if (typeof dobRaw === 'string' && dobRaw.trim()) {
    date_of_birth = dobRaw.trim().slice(0, 10)
  }

  return {
    phone: typeof row.phone === 'string' && row.phone.trim() ? row.phone.trim() : null,
    date_of_birth,
    service_branch: typeof row.service_branch === 'string' && row.service_branch.trim()
      ? row.service_branch.trim()
      : null,
    service_rank: typeof row.service_rank === 'string' && row.service_rank.trim()
      ? row.service_rank.trim()
      : null,
    service_start_year: typeof row.service_start_year === 'number' ? row.service_start_year : null,
    service_end_year: typeof row.service_end_year === 'number' ? row.service_end_year : null
  }
}
