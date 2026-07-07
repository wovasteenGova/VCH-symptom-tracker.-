import { useState } from '#imports'

type SubmissionToastPayload = {
  message: string
  highlight?: string
  tone?: 'success' | 'error'
  durationMs?: number
}

function normalizeSubmissionToastPayload(payload: string | SubmissionToastPayload): SubmissionToastPayload {
  if (typeof payload === 'string') {
    return { message: payload, tone: 'success' }
  }

  return {
    tone: 'success',
    ...payload
  }
}

export { normalizeSubmissionToastPayload }
export type { SubmissionToastPayload }

let dismissTimer: ReturnType<typeof setTimeout> | undefined

function normalizePayload(payload: string | SubmissionToastPayload): SubmissionToastPayload {
  return normalizeSubmissionToastPayload(payload)
}

export function useSubmissionToast() {
  const activeToast = useState<SubmissionToastPayload | null>('submission-toast', () => null)
  const toastKey = useState('submission-toast-key', () => 0)

  function showSubmissionToast(payload: string | SubmissionToastPayload) {
    if (dismissTimer) {
      clearTimeout(dismissTimer)
    }

    const normalized = normalizeSubmissionToastPayload(payload)
    const isReplacement = activeToast.value !== null

    if (!isReplacement) {
      toastKey.value += 1
    }

    activeToast.value = normalized

    const durationMs = activeToast.value.tone === 'error'
      ? activeToast.value.durationMs ?? 4200
      : activeToast.value.durationMs ?? 1800

    dismissTimer = setTimeout(() => {
      activeToast.value = null
    }, durationMs)
  }

  function clearSubmissionToast() {
    if (dismissTimer) {
      clearTimeout(dismissTimer)
    }

    activeToast.value = null
  }

  return {
    activeToast,
    toastKey,
    showSubmissionToast,
    clearSubmissionToast
  }
}
