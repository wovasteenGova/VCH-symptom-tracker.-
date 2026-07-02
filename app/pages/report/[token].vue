<template>
  <main class="min-h-dvh bg-slate-950 text-white">
    <section class="mx-auto min-h-dvh w-full max-w-md px-4 pb-8 pt-6 sm:max-w-lg">
      <div class="rounded-4xl border border-slate-800 bg-slate-900 p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Supporter Report</p>
        <h1 class="mt-2 text-2xl font-bold text-white">Submit an observation</h1>
        <p class="mt-2 text-sm leading-6 text-slate-400">
          Enter your information and what you observed. The veteran reviews these notes before using them.
        </p>
      </div>

      <section v-if="isLoading" class="mt-5 rounded-4xl border border-slate-800 bg-slate-900 p-5 text-center text-slate-400">
        Loading link...
      </section>

      <section v-else-if="pageError" class="mt-5 rounded-4xl border border-red-900 bg-red-950/40 p-5 text-center text-red-200">
        {{ pageError }}
      </section>

      <form v-else class="mt-5 space-y-4" @submit.prevent="submitObservation">
        <section class="rounded-4xl border border-slate-800 bg-slate-900/80 p-4">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Your information</p>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            This will appear on the report. Enter your own details — do not use someone else’s name.
          </p>

          <div class="mt-4 grid grid-cols-2 gap-3">
            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">First name</span>
              <input
                v-model="form.first_name"
                type="text"
                autocomplete="given-name"
                class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                placeholder="First name"
                required
              >
            </label>

            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Last name</span>
              <input
                v-model="form.last_name"
                type="text"
                autocomplete="family-name"
                class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                placeholder="Last name"
                required
              >
            </label>
          </div>

          <label class="mt-4 block">
            <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Email</span>
            <input
              v-model="form.email"
              type="email"
              autocomplete="email"
              class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
              placeholder="you@example.com"
              required
            >
          </label>

          <label class="mt-4 block">
            <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Phone</span>
            <input
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
              placeholder="(555) 555-5555"
              required
            >
          </label>

          <label class="mt-4 block">
            <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Relationship to veteran</span>
            <input
              v-model="form.relationship"
              type="text"
              class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
              placeholder="Spouse, parent, friend, caregiver"
              required
            >
            <div class="mt-3 flex flex-wrap gap-2 px-1">
              <button
                v-for="suggestion in relationshipSuggestions"
                :key="suggestion.label"
                type="button"
                class="rounded-full px-3.5 py-2 text-sm font-bold ring-1 transition hover:brightness-110"
                :class="[
                  suggestion.classes,
                  form.relationship === suggestion.label
                    ? 'ring-2 ring-white/80'
                    : 'ring-white/10'
                ]"
                @click="form.relationship = suggestion.label"
              >
                {{ suggestion.label }}
              </button>
            </div>
          </label>
        </section>

        <label class="block">
          <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Condition</span>
          <select
            v-model="form.condition_label"
            class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none focus:border-slate-400"
            required
          >
            <option value="" disabled>Select condition</option>
            <option
              v-for="condition in supporterProfile?.visible_conditions || []"
              :key="condition"
              :value="condition"
            >
              {{ condition }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Observed at</span>
          <input
            v-model="form.observed_at"
            type="datetime-local"
            class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none focus:border-slate-400"
            required
          >
        </label>

        <label class="block">
          <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Severity 0-10</span>
          <div class="rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4">
            <div class="mb-4 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-300">Mild</span>
              <span class="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-950">{{ form.severity }}/10</span>
              <span class="text-sm font-semibold text-slate-300">Severe</span>
            </div>
            <USlider v-model="form.severity" :min="0" :max="10" :step="1" size="xl" color="neutral" tooltip />
          </div>
        </label>

        <label class="block">
          <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Impact you noticed</span>
          <textarea
            v-model="form.impact"
            rows="3"
            class="w-full resize-none rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
            placeholder="What changed in work, sleep, mood, chores, walking, family time, etc.?"
            required
          />
        </label>

        <label class="block">
          <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Notes</span>
          <textarea
            v-model="form.notes"
            rows="3"
            class="w-full resize-none rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
            placeholder="Optional extra details"
          />
        </label>

        <section class="rounded-3xl border border-slate-700/80 bg-slate-800/50 p-4">
          <p class="text-sm leading-6 text-slate-300">
            {{ declarationText }}
          </p>

          <p
            v-if="reporterFullName"
            class="mt-3 rounded-2xl bg-slate-900/80 px-3 py-2 text-sm text-slate-200"
          >
            Report will list:
            <span class="font-bold text-white">{{ reporterFullName }}</span>
            <span v-if="form.email"> · {{ form.email }}</span>
            <span v-if="form.phone"> · {{ form.phone }}</span>
            <span v-if="form.relationship"> · {{ form.relationship }}</span>
          </p>

          <label class="mt-4 flex cursor-pointer items-start gap-3">
            <input
              v-model="hasAffirmedDeclaration"
              type="checkbox"
              class="mt-1 size-5 shrink-0 rounded border-slate-500 bg-slate-900 text-white focus:ring-slate-400"
            >
            <span class="text-sm font-semibold leading-6 text-white">
              I affirm that this statement is true and accurate to the best of my knowledge, and I agree that my name and contact information above will appear on this report.
            </span>
          </label>

          <label class="mt-4 block">
            <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Electronic signature</span>
            <input
              v-model="form.signature_name"
              type="text"
              autocomplete="name"
              class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
              placeholder="Type your full legal name"
              :disabled="!hasAffirmedDeclaration"
            >
            <p class="mt-2 px-1 text-xs leading-5 text-slate-400">
              Must match the name you entered above. Typing your name acts as your electronic signature.
            </p>
          </label>
        </section>

        <p v-if="submitError" class="text-center text-sm font-medium text-red-300">{{ submitError }}</p>

        <button
          type="submit"
          class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition enabled:hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="isSubmitting || !canSubmit"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit Observation' }}
        </button>

        <p v-if="pageMessage" class="text-center text-sm font-medium text-emerald-200">{{ pageMessage }}</p>
      </form>

      <footer class="mt-6 flex items-center justify-center gap-3 text-xs font-semibold text-slate-500">
        <NuxtLink to="/privacy" class="hover:text-slate-300">Privacy</NuxtLink>
        <NuxtLink to="/disclaimer" class="hover:text-slate-300">Disclaimer</NuxtLink>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useSupabaseClient } from '../../composables/useSupabaseClient'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const declarationText =
  'By submitting this observation, you confirm that the information provided reflects what you personally observed and is submitted in good faith. Your name, email, phone number, and relationship will be stored on this report for the veteran’s review.'

const relationshipSuggestions = [
  { label: 'Spouse', classes: 'bg-fuchsia-500/25 text-fuchsia-100' },
  { label: 'Parent', classes: 'bg-rose-500/25 text-rose-100' },
  { label: 'Child', classes: 'bg-cyan-500/25 text-cyan-100' },
  { label: 'Sibling', classes: 'bg-amber-500/25 text-amber-100' },
  { label: 'Friend', classes: 'bg-indigo-500/25 text-indigo-100' },
  { label: 'Caregiver', classes: 'bg-orange-500/25 text-orange-100' },
  { label: 'Neighbor', classes: 'bg-lime-500/25 text-lime-100' },
  { label: 'Other', classes: 'bg-slate-500/30 text-slate-200' }
]

const route = useRoute()
const supabase = useSupabaseClient()
const token = String(route.params.token || '')

const supporterProfile = ref<null | {
  id: string
  display_name: string
  visible_conditions: string[]
}>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const hasAffirmedDeclaration = ref(false)
const pageError = ref('')
const submitError = ref('')
const pageMessage = ref('')
const form = ref({
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  relationship: '',
  condition_label: '',
  observed_at: '',
  severity: 5,
  impact: '',
  notes: '',
  signature_name: ''
})

const reporterFullName = computed(() => {
  return [form.value.first_name, form.value.last_name].filter(Boolean).join(' ').trim()
})

const canSubmit = computed(() => {
  const signatureMatchesName =
    form.value.signature_name.trim().toLowerCase() === reporterFullName.value.toLowerCase()

  return Boolean(
    reporterFullName.value &&
    form.value.email.trim() &&
    form.value.phone.trim() &&
    form.value.relationship.trim() &&
    form.value.condition_label &&
    form.value.impact.trim() &&
    hasAffirmedDeclaration.value &&
    form.value.signature_name.trim().length >= 2 &&
    signatureMatchesName
  )
})

watch(reporterFullName, (fullName) => {
  if (!form.value.signature_name.trim() && fullName) {
    form.value.signature_name = fullName
  }
})

onMounted(async () => {
  setDefaultObservedAt()
  await loadSupporterProfile()
})

function setDefaultObservedAt() {
  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60000
  form.value.observed_at = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function resetReporterFields() {
  form.value.first_name = ''
  form.value.last_name = ''
  form.value.email = ''
  form.value.phone = ''
  form.value.relationship = ''
  form.value.signature_name = ''
  hasAffirmedDeclaration.value = false
}

async function loadSupporterProfile() {
  isLoading.value = true
  pageError.value = ''

  const { data, error } = await supabase.rpc('get_supporter_profile_by_token', {
    link_token: token
  })

  if (error) {
    pageError.value = error.message
    isLoading.value = false
    return
  }

  supporterProfile.value = data?.[0] || null

  if (!supporterProfile.value) {
    pageError.value = 'This supporter link is invalid or disabled.'
  } else {
    form.value.condition_label = supporterProfile.value.visible_conditions[0] || ''
  }

  isLoading.value = false
}

async function submitObservation() {
  if (!isValidEmail(form.value.email)) {
    submitError.value = 'Enter a valid email address.'
    return
  }

  if (!canSubmit.value) {
    submitError.value =
      'Complete your information, check the affirmation, and sign with your full legal name exactly as entered above.'
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  pageMessage.value = ''

  const { error } = await supabase.rpc('submit_supporter_observation', {
    link_token: token,
    condition_label: form.value.condition_label,
    observed_at: new Date(form.value.observed_at).toISOString(),
    severity: form.value.severity,
    impact: form.value.impact,
    notes: form.value.notes || null,
    declaration_text: declarationText,
    signature_name: form.value.signature_name.trim(),
    reporter_first_name: form.value.first_name.trim(),
    reporter_last_name: form.value.last_name.trim(),
    reporter_email: form.value.email.trim(),
    reporter_phone: form.value.phone.trim(),
    reporter_relationship: form.value.relationship.trim()
  })

  if (error) {
    submitError.value = error.message
  } else {
    pageMessage.value = 'Observation submitted. Thank you.'
    form.value.impact = ''
    form.value.notes = ''
    form.value.severity = 5
    resetReporterFields()
    setDefaultObservedAt()
  }

  isSubmitting.value = false
}
</script>
