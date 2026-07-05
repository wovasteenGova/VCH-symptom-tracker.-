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
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
        @click.self="handleClose"
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
            class="flex max-h-[min(82dvh,640px)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-900 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-support-title"
          >
            <div class="flex shrink-0 items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Support
                </p>
                <h2 id="contact-support-title" class="mt-1 text-xl font-bold text-white">
                  Contact us
                </h2>
              </div>
              <button
                type="button"
                class="grid size-10 place-items-center rounded-full bg-slate-800 text-slate-200 transition hover:bg-slate-700"
                aria-label="Close contact form"
                @click="handleClose"
              >
                <UIcon name="i-lucide-x" class="size-5" />
              </button>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
              <template v-if="submitted">
                <p class="text-sm leading-6 text-slate-300">
                  Thanks — your message is on its way. We usually reply within a few business days.
                </p>
                <button
                  type="button"
                  class="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
                  @click="handleClose"
                >
                  Done
                </button>
              </template>

              <form v-else class="space-y-4" @submit.prevent="handleSubmit">
                <p class="text-sm leading-6 text-slate-400">
                  Questions about logging, Pro, or your account? Send a note and we will get back to you by email.
                </p>

                <label class="block">
                  <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Name</span>
                  <input
                    v-model="name"
                    type="text"
                    name="name"
                    autocomplete="name"
                    class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-3 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="Your name"
                    required
                  >
                </label>

                <label class="block">
                  <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Email</span>
                  <input
                    v-model="email"
                    type="email"
                    name="email"
                    autocomplete="email"
                    inputmode="email"
                    autocapitalize="none"
                    class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-3 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="you@example.com"
                    required
                  >
                </label>

                <label class="block">
                  <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Message</span>
                  <textarea
                    v-model="message"
                    name="message"
                    rows="4"
                    class="w-full resize-y rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-3 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                    placeholder="How can we help?"
                    required
                  />
                </label>

                <p v-if="formError" class="text-sm font-medium text-red-300">{{ formError }}</p>

                <button
                  type="submit"
                  class="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
                  :disabled="loading"
                >
                  {{ loading ? 'Sending...' : 'Send message' }}
                </button>
              </form>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
