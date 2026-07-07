import { normalizeAuthEmail } from './authNotices'

const STORAGE_KEY = 'symptom-tracker-auth-email-sent'

export const AUTH_EMAIL_COOLDOWN_MS = 60_000

type SentAtMap = Record<string, number>

function readSentAtMap(): SentAtMap {
  if (!import.meta.client) {
    return {}
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) as SentAtMap : {}
  } catch {
    return {}
  }
}

function writeSentAtMap(map: SentAtMap) {
  if (!import.meta.client) {
    return
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

export function getAuthEmailCooldownRemaining(email: string) {
  const normalized = normalizeAuthEmail(email)

  if (!normalized) {
    return 0
  }

  const lastSentAt = readSentAtMap()[normalized] ?? 0
  return Math.max(0, AUTH_EMAIL_COOLDOWN_MS - (Date.now() - lastSentAt))
}

export function markAuthEmailSent(email: string) {
  const normalized = normalizeAuthEmail(email)

  if (!normalized || !import.meta.client) {
    return
  }

  const map = readSentAtMap()
  map[normalized] = Date.now()
  writeSentAtMap(map)
}

export function formatAuthEmailCooldownMessage(remainingMs: number) {
  const seconds = Math.max(1, Math.ceil(remainingMs / 1000))
  return `Please wait ${seconds} seconds before requesting another email for this address.`
}

export function isAuthEmailCooldownMessage(message: string) {
  return /^Please wait \d+ seconds before requesting another email/i.test(message)
}

export function assertAuthEmailCooldown(email: string) {
  const remainingMs = getAuthEmailCooldownRemaining(email)

  if (remainingMs > 0) {
    throw new Error(formatAuthEmailCooldownMessage(remainingMs))
  }
}
