export type SubmissionToastPayload = {
  message: string
  highlight?: string
  tone?: 'success' | 'error'
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

    dismissTimer = setTimeout(() => {
      activeToast.value = null
    }, 3200)
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
