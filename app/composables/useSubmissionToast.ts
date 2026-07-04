import { useState } from '#imports'

export type SubmissionToastPayload = {
  message: string
  highlight?: string
  tone?: 'success' | 'error'
  durationMs?: number
}

let dismissTimer: ReturnType<typeof setTimeout> | undefined

function normalizePayload(payload: string | SubmissionToastPayload): SubmissionToastPayload {
  if (typeof payload === 'string') {
    return { message: payload, tone: 'success' }
  }

  return {
    tone: 'success',
    ...payload
  }
}

export function useSubmissionToast() {
  const activeToast = useState<SubmissionToastPayload | null>('submission-toast', () => null)
  const toastKey = useState('submission-toast-key', () => 0)

  function showSubmissionToast(payload: string | SubmissionToastPayload) {
    if (dismissTimer) {
      clearTimeout(dismissTimer)
    }

    toastKey.value += 1
    activeToast.value = normalizePayload(payload)

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
