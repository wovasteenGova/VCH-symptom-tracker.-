import { ref, useRuntimeConfig } from '#imports'

const WEB3FORMS_URL = 'https://api.web3forms.com/submit'

/** Distinct subject prefixes for inbox filtering at web3forms.com */
export const WEB3FORMS_SUBJECTS = {
  contact: '[Symptom Tracker Support]'
} as const

export type Web3FormsType = keyof typeof WEB3FORMS_SUBJECTS

/** Public client key — same inbox as VCH contact (also baked into VCH production JS). Env var overrides. */
const WEB3FORMS_PUBLIC_ACCESS_KEY = 'af8927c4-992e-4ced-876b-9134b5ba1c43'

const MISSING_KEY_MESSAGE =
  'Form delivery is not configured. Set NUXT_PUBLIC_WEB3FORMS_ACCESS_KEY in your environment (see .env.example).'

export type SubmitWeb3FormOptions = {
  formType: Web3FormsType
  subject?: string
  fields?: Record<string, string | number | boolean>
  fromName?: string
  replyTo?: string
}

export function useWeb3Forms() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const config = useRuntimeConfig()

  function getAccessKey() {
    const key = String(
      config.public.web3formsAccessKey
      || import.meta.env.NUXT_PUBLIC_WEB3FORMS_ACCESS_KEY
      || WEB3FORMS_PUBLIC_ACCESS_KEY
    ).trim()
    if (!key) {
      throw new Error(MISSING_KEY_MESSAGE)
    }
    return key
  }

  async function submitWeb3Form({
    formType,
    subject,
    fields = {},
    fromName,
    replyTo
  }: SubmitWeb3FormOptions) {
    try {
      loading.value = true
      error.value = null

      const accessKey = getAccessKey()
      const subjectLine =
        subject ||
        `${WEB3FORMS_SUBJECTS[formType] || '[Symptom Tracker]'} New submission`

      const payload: Record<string, string | number | boolean> = {
        access_key: accessKey,
        subject: subjectLine,
        form_type: formType,
        ...fields
      }

      if (fromName) {
        payload.from_name = fromName
      }

      if (replyTo) {
        payload.replyto = replyTo
      }

      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => ({})) as { success?: boolean, message?: string }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Form submission failed. Please try again.')
      }

      return { success: true as const, data }
    } catch (err) {
      const message = err instanceof Error
        ? err.message
        : 'Form submission failed. Please try again.'
      error.value = message
      console.error('Web3Forms submission error:', err)
      return { success: false as const, error: message }
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    submitWeb3Form,
    WEB3FORMS_SUBJECTS
  }
}
