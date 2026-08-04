<script setup lang="ts">
import { ref, watch } from 'vue'
import { useWeb3Forms, WEB3FORMS_SUBJECTS } from '../composables/useWeb3Forms'
import { useSubmissionToast } from '../composables/useSubmissionToast'

const props = defineProps<{
  open: boolean
  defaultName?: string
  defaultEmail?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { loading, error, submitWeb3Form } = useWeb3Forms()
const { showSubmissionToast } = useSubmissionToast()

const name = ref('')
const email = ref('')
const message = ref('')
const formError = ref('')
const submitted = ref(false)

const fieldClass = 'w-full rounded-xl border border-default/80 bg-default/40 px-3.5 py-2.5 text-sm text-highlighted outline-none transition placeholder:text-muted/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15'
const labelClass = 'mb-1.5 block text-xs font-semibold text-highlighted'

watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    return
  }

  name.value = props.defaultName?.trim() || ''
  email.value = props.defaultEmail?.trim() || ''
  message.value = ''
  formError.value = ''
  submitted.value = false
})

async function handleSubmit() {
  formError.value = ''

  const trimmedName = name.value.trim()
  const trimmedEmail = email.value.trim()
  const trimmedMessage = message.value.trim()

  if (!trimmedName) {
    formError.value = 'Enter your name.'
    return
  }

  if (!trimmedEmail) {
    formError.value = 'Enter your email.'
    return
  }

  if (!trimmedMessage) {
    formError.value = 'Enter a message.'
    return
  }

  const result = await submitWeb3Form({
    formType: 'contact',
    subject: `${WEB3FORMS_SUBJECTS.contact} Contact form`,
    fromName: trimmedName,
    replyTo: trimmedEmail,
    fields: {
      name: trimmedName,
      email: trimmedEmail,
      message: trimmedMessage,
      source: 'Symptom Tracker Support'
    }
  })

  if (!result.success) {
    formError.value = result.error || error.value || 'Could not send your message. Try again.'
    return
  }

  submitted.value = true
  showSubmissionToast('Message sent. We will reply by email.')
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <AppOverlayShell
      v-if="open"
      settings-support-overlay
      :z-index="120"
      backdrop-class="bg-black/55 lg:bg-black/55"
      @dismiss="handleClose"
    >
      <Transition
        enter-active-class="transition duration-250 ease-out"
        enter-from-class="translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95"
        enter-to-class="translate-y-0 opacity-100 sm:scale-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100 sm:scale-100"
        leave-to-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
      >
        <section
          v-if="open"
          class="app-overlay-panel app-overlay-panel--stack flex max-h-[min(92dvh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-none border-0 bg-default shadow-none lg:max-h-[min(80dvh,40rem)] lg:rounded-[1.75rem] lg:border lg:border-default/80 lg:shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-support-title"
        >
          <div class="flex shrink-0 items-start justify-between gap-3 border-b border-default/60 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)] lg:py-4">
            <div class="min-w-0">
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                Support
              </p>
              <h2 id="contact-support-title" class="mt-1 text-xl font-bold text-highlighted">
                Contact us
              </h2>
            </div>
            <button
              type="button"
              class="grid size-9 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-elevated/60 hover:text-highlighted"
              aria-label="Close contact form"
              @click="handleClose"
            >
              <UIcon name="i-lucide-x" class="size-5" />
            </button>
          </div>

          <div class="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
            <template v-if="submitted">
              <div class="flex flex-col items-center px-2 py-6 text-center">
                <span class="grid size-14 place-items-center rounded-full bg-success/15 text-success">
                  <UIcon name="i-lucide-check" class="size-7" />
                </span>
                <p class="mt-4 text-base font-semibold text-highlighted">
                  Message sent
                </p>
                <p class="mt-2 max-w-sm text-sm leading-6 text-muted">
                  Thanks — we got your note and usually reply within a few business days at the email you provided.
                </p>
                <button
                  type="button"
                  class="mt-6 w-full max-w-xs rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                  @click="handleClose"
                >
                  Done
                </button>
              </div>
            </template>

            <form v-else class="space-y-5" @submit.prevent="handleSubmit">
              <div class="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5">
                <div class="flex items-start gap-3">
                  <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                    <UIcon name="i-lucide-mail" class="size-5" />
                  </span>
                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-highlighted">
                      Email our support team
                    </p>
                    <p class="mt-1 text-xs leading-5 text-muted">
                      Questions about logging, Pro, or your account — we reply by email, usually within a few business days.
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block sm:col-span-1">
                  <span :class="labelClass">Name</span>
                  <input
                    v-model="name"
                    type="text"
                    name="name"
                    autocomplete="name"
                    :class="fieldClass"
                    placeholder="Your name"
                    required
                  >
                </label>

                <label class="block sm:col-span-1">
                  <span :class="labelClass">Email</span>
                  <input
                    v-model="email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    inputmode="email"
                    autocapitalize="none"
                    :class="fieldClass"
                    placeholder="you@example.com"
                    required
                  >
                </label>
              </div>

              <label class="block">
                <span :class="labelClass">Message</span>
                <textarea
                  v-model="message"
                  name="message"
                  rows="5"
                  :class="`${fieldClass} min-h-[7.5rem] resize-y`"
                  placeholder="Tell us what you need help with — the more detail, the better we can assist."
                  required
                />
              </label>

              <p
                v-if="formError"
                class="rounded-xl border border-error/30 bg-error/10 px-3.5 py-2.5 text-sm font-medium text-error"
              >
                {{ formError }}
              </p>

              <button
                type="submit"
                class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
                :disabled="loading"
              >
                <UIcon
                  v-if="loading"
                  name="i-lucide-loader-circle"
                  class="size-4 animate-spin"
                />
                <UIcon
                  v-else
                  name="i-lucide-send"
                  class="size-4"
                />
                {{ loading ? 'Sending…' : 'Send message' }}
              </button>
            </form>
          </div>
        </section>
      </Transition>
    </AppOverlayShell>
  </Transition>
</template>
