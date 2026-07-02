<template>
  <main class="flex min-h-dvh flex-col bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
    <section class="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4 sm:max-w-lg">
      <header class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Supporter Report</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Submit an observation</h1>
        </div>

        <UColorModeSwitch
          size="md"
          color="primary"
          class="header-color-toggle shrink-0"
        />
      </header>

      <div class="mt-5 rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p class="text-sm leading-6 text-slate-600 dark:text-slate-400">
          Enter your information and what you observed. The veteran reviews these notes before using them.
        </p>
      </div>

      <section v-if="isLoading" class="mt-5 rounded-4xl border border-slate-200 bg-white p-5 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        Loading link...
      </section>

      <section v-else-if="pageError" class="mt-5 rounded-4xl border border-red-200 bg-red-50 p-5 text-center text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        {{ pageError }}
      </section>

      <template v-else>
        <div class="shrink-0 space-y-5">
        <section
          v-if="supporterProfile?.entry_context_summary"
          class="rounded-4xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-500/30 dark:bg-teal-950/30"
        >
          <p class="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-200">About this entry</p>
          <p class="mt-2 text-sm leading-6 text-teal-950/90 dark:text-teal-50/90">
            The veteran shared a private link about
            <span class="font-semibold text-slate-950 dark:text-white">{{ supporterProfile.entry_context_summary }}</span>.
          </p>
        </section>
        </div>

        <form
          class="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
          @submit.prevent="handleObservationPrimaryAction"
        >
          <div class="sticky top-0 z-20 flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
            <button
              type="button"
              class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              :disabled="observationStep === 0"
              aria-label="Previous step"
              @click="showPreviousObservationStep"
            >
              <UIcon name="i-lucide-chevron-left" class="size-5" />
            </button>

            <div class="min-w-0 flex-1">
              <p class="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Step {{ observationStep + 1 }} of {{ observationStepCount }}
              </p>
              <p class="mt-1 truncate text-center text-sm font-semibold text-slate-950 dark:text-white">
                {{ currentStepTitle }}
              </p>
              <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  class="h-full rounded-full bg-slate-950 transition-all duration-300 dark:bg-slate-500"
                  :style="{ width: observationProgressWidth }"
                />
              </div>
            </div>

            <button
              type="button"
              class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              :disabled="isLastObservationStep"
              aria-label="Next step"
              @click="tryAdvanceObservationStep"
            >
              <UIcon name="i-lucide-chevron-right" class="size-5" />
            </button>
          </div>

          <div class="flex min-h-[22rem] flex-col overflow-hidden">
            <Transition
              mode="out-in"
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="translate-x-4 opacity-0"
              enter-to-class="translate-x-0 opacity-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="translate-x-0 opacity-100"
              leave-to-class="-translate-x-4 opacity-0"
            >
              <div
                :key="observationStep"
                class="flex min-h-0 flex-1 flex-col overflow-y-auto no-scrollbar px-4 py-5"
                :class="observationStep === 2 ? 'justify-center' : 'justify-start space-y-6'"
              >
                <!-- Step 0: Your information -->
                <template v-if="observationStep === 0">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Your information</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      This will appear on the report. Enter your own details — do not use someone else’s name.
                    </p>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <label class="block">
                      <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">First name</span>
                      <input
                        v-model="form.first_name"
                        type="text"
                        autocomplete="given-name"
                        class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                        placeholder="First name"
                      >
                    </label>

                    <label class="block">
                      <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Last name</span>
                      <input
                        v-model="form.last_name"
                        type="text"
                        autocomplete="family-name"
                        class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                        placeholder="Last name"
                      >
                    </label>
                  </div>

                  <label class="block">
                    <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Email</span>
                    <input
                      v-model="form.email"
                      type="email"
                      autocomplete="email"
                      class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                      placeholder="you@example.com"
                    >
                  </label>

                  <label class="block">
                    <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Phone</span>
                    <input
                      v-model="form.phone"
                      type="tel"
                      autocomplete="tel"
                      class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                      placeholder="(555) 555-5555"
                    >
                  </label>

                  <label class="block">
                    <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Relationship to veteran</span>
                    <input
                      v-model="form.relationship"
                      type="text"
                      class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                      placeholder="Partner, spouse, parent, friend, caregiver"
                    >
                    <div class="mt-3 flex flex-wrap gap-2 px-1">
                      <button
                        v-for="suggestion in relationshipSuggestions"
                        :key="suggestion.label"
                        type="button"
                        class="rounded-full border px-3 py-1.5 text-xs font-bold transition"
                        :class="relationshipChipClass(suggestion)"
                        @click="form.relationship = suggestion.label"
                      >
                        {{ suggestion.label }}
                      </button>
                    </div>
                  </label>
                </template>

                <!-- Step 1: Condition & time -->
                <template v-else-if="observationStep === 1">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">What you observed</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Choose the condition and when you noticed it.
                    </p>
                  </div>

                  <label class="block">
                    <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Condition</span>
                    <select
                      v-model="form.condition_label"
                      class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400 dark:[color-scheme:dark]"
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
                    <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Observed at</span>
                    <input
                      v-model="form.observed_at"
                      type="datetime-local"
                      class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400 dark:[color-scheme:dark]"
                    >
                  </label>
                </template>

                <!-- Step 2: Severity -->
                <template v-else-if="observationStep === 2">
                  <div class="space-y-1 text-center">
                    <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Severity you noticed
                    </p>
                    <p class="text-xs leading-5 text-slate-500 dark:text-slate-400">
                      Slide between mild and severe based on what you saw.
                    </p>
                  </div>

                  <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Mild</span>
                    <span class="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white dark:bg-slate-700 dark:text-slate-100">
                      {{ severityValue }}/10
                    </span>
                    <span>Severe</span>
                  </div>

                  <USlider
                    v-model="severityValue"
                    :min="0"
                    :max="10"
                    :step="1"
                    size="xl"
                    color="neutral"
                    tooltip
                  />

                  <div class="flex flex-wrap justify-center gap-2">
                    <button
                      v-for="preset in severityQuickPresets"
                      :key="preset.label"
                      type="button"
                      class="rounded-full border px-3 py-1.5 text-xs font-bold transition"
                      :class="severityValue === preset.value
                        ? 'border-slate-950 bg-slate-950 text-white dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800'"
                      @click="severityValue = preset.value"
                    >
                      {{ preset.label }}
                    </button>
                  </div>

                  <div class="min-h-[5rem] overflow-hidden">
                    <Transition
                      name="severity-guide"
                      mode="out-in"
                    >
                      <div
                        :key="severityValue"
                        class="rounded-2xl bg-slate-100/80 px-5 py-4 dark:bg-slate-800/80"
                      >
                        <p class="text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                          {{ severityGuidance.title }}
                        </p>
                        <p class="mt-2 text-center text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {{ severityGuidance.text }}
                        </p>
                      </div>
                    </Transition>
                  </div>
                </template>

                <!-- Step 3: Impact & notes -->
                <template v-else-if="observationStep === 3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Impact & notes</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Describe how this affected daily life, work, sleep, mood, or activity.
                    </p>
                  </div>

                  <label class="block">
                    <span class="mb-4 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Impact you noticed</span>
                    <textarea
                      v-model="form.impact"
                      rows="4"
                      class="w-full resize-none border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                      placeholder="What changed in work, sleep, mood, chores, walking, family time, etc.?"
                    />
                  </label>

                  <label class="block">
                    <span class="mb-4 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Notes (optional)</span>
                    <textarea
                      v-model="form.notes"
                      rows="3"
                      class="w-full resize-none border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                      placeholder="Optional extra details"
                    />
                  </label>
                </template>

                <!-- Step 4: Declaration -->
                <template v-else>
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Sign & submit</p>
                    <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Review the affirmation and sign with your full legal name.
                    </p>
                  </div>

                  <div class="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <p class="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {{ declarationText }}
                    </p>

                    <p
                      v-if="reporterFullName"
                      class="mt-3 rounded-2xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                    >
                      Report will list:
                      <span class="font-bold text-slate-950 dark:text-white">{{ reporterFullName }}</span>
                      <span v-if="form.email"> · {{ form.email }}</span>
                      <span v-if="form.phone"> · {{ form.phone }}</span>
                      <span v-if="form.relationship"> · {{ form.relationship }}</span>
                    </p>

                    <label class="mt-4 flex cursor-pointer items-start gap-3">
                      <input
                        v-model="hasAffirmedDeclaration"
                        type="checkbox"
                        class="mt-1 size-5 shrink-0 rounded border-slate-300 bg-white text-slate-950 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200"
                      >
                      <span class="text-sm font-semibold leading-6 text-slate-950 dark:text-white">
                        I affirm that this statement is true and accurate to the best of my knowledge, and I agree that my name and contact information above will appear on this report.
                      </span>
                    </label>

                    <label class="mt-4 block">
                      <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Electronic signature</span>
                      <input
                        v-model="form.signature_name"
                        type="text"
                        autocomplete="name"
                        class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-400"
                        placeholder="Type your full legal name"
                        @input="signatureManuallyEdited = true"
                      >
                      <p class="mt-2 px-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Include your first and last name (capitalization does not matter).
                      </p>
                    </label>
                  </div>
                </template>
              </div>
            </Transition>
          </div>

          <StickyActionBar>
            <ul
              v-if="currentStepBlockers.length && !isSubmitting"
              class="mb-4 rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/60 dark:bg-amber-950/30"
            >
              <li
                v-for="blocker in currentStepBlockers"
                :key="blocker"
                class="flex items-start gap-2 py-1 text-sm text-amber-950 dark:text-amber-100"
              >
                <UIcon name="i-lucide-circle-dot" class="mt-0.5 size-4 shrink-0" />
                <span>{{ blocker }}</span>
              </li>
            </ul>

            <p v-if="submitError" class="mb-4 text-center text-sm font-medium text-red-600 dark:text-red-300">{{ submitError }}</p>

            <button
              type="submit"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
              :disabled="isSubmitting || (isLastObservationStep && !canSubmit)"
            >
              {{ isSubmitting ? 'Submitting...' : isLastObservationStep ? 'Submit Observation' : 'Continue' }}
              <UIcon :name="isLastObservationStep ? 'i-lucide-check' : 'i-lucide-arrow-right'" class="size-5" />
            </button>

            <p v-if="pageMessage" class="mt-4 text-center text-sm font-medium text-emerald-700 dark:text-emerald-200">{{ pageMessage }}</p>
          </StickyActionBar>
        </form>

        <footer class="mt-6 flex shrink-0 items-center justify-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))] text-xs font-semibold text-slate-500">
          <NuxtLink to="/privacy" class="hover:text-slate-700 dark:hover:text-slate-300">Privacy</NuxtLink>
          <NuxtLink to="/disclaimer" class="hover:text-slate-700 dark:hover:text-slate-300">Disclaimer</NuxtLink>
        </footer>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useSupabaseClient } from '../../composables/useSupabaseClient'
import { getSeverityGuidance, severityQuickPresets } from '../../utils/severityGuidance'
import { signatureMatchesReporter } from '../../utils/signatureMatch'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const declarationText =
  'By submitting this observation, you confirm that the information provided reflects what you personally observed and is submitted in good faith. Your name, email, phone number, and relationship will be stored on this report for the veteran’s review.'

const observationStepTitles = [
  'Your information',
  'What you observed',
  'Severity',
  'Impact & notes',
  'Sign & submit'
]

const observationStepCount = observationStepTitles.length

const relationshipSuggestions = [
  { label: 'Partner', tone: 'partner' },
  { label: 'Spouse', tone: 'default' },
  { label: 'Parent', tone: 'default' },
  { label: 'Child', tone: 'default' },
  { label: 'Sibling', tone: 'default' },
  { label: 'Friend', tone: 'default' },
  { label: 'Caregiver', tone: 'default' },
  { label: 'Neighbor', tone: 'default' },
  { label: 'Other', tone: 'default' }
] as const

const route = useRoute()
const supabase = useSupabaseClient()
const token = String(route.params.token || '')

const supporterProfile = ref<null | {
  id: string
  display_name: string
  visible_conditions: string[]
  linked_entry_id?: string | null
  entry_context_summary?: string | null
}>(null)
const observationStep = ref(0)
const isLoading = ref(true)
const isSubmitting = ref(false)
const hasAffirmedDeclaration = ref(false)
const signatureManuallyEdited = ref(false)
const severityValue = ref(5)
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
  impact: '',
  notes: '',
  signature_name: ''
})

const reporterFullName = computed(() => {
  return [form.value.first_name, form.value.last_name].filter(Boolean).join(' ').trim()
})

const severityGuidance = computed(() => getSeverityGuidance(severityValue.value))

const currentStepTitle = computed(() => observationStepTitles[observationStep.value] || '')

const isLastObservationStep = computed(() => observationStep.value >= observationStepCount - 1)

const observationProgressWidth = computed(() => {
  return `${((observationStep.value + 1) / observationStepCount) * 100}%`
})

const signatureMatchesName = computed(() => {
  return signatureMatchesReporter(
    form.value.signature_name,
    form.value.first_name,
    form.value.last_name
  )
})

const canSubmit = computed(() => getAllSubmitBlockers().length === 0)

function getStepBlockers(step: number) {
  const blockers: string[] = []

  if (step === 0) {
    if (!form.value.first_name.trim() || !form.value.last_name.trim()) {
      blockers.push('Enter your first and last name.')
    }

    if (!form.value.email.trim()) {
      blockers.push('Enter your email address.')
    } else if (!isValidEmail(form.value.email)) {
      blockers.push('Enter a valid email address.')
    }

    if (!form.value.phone.trim()) {
      blockers.push('Enter your phone number.')
    }

    if (!form.value.relationship.trim()) {
      blockers.push('Enter your relationship to the veteran.')
    }
  }

  if (step === 1) {
    if (!form.value.condition_label) {
      blockers.push('Choose a condition.')
    }

    if (!form.value.observed_at) {
      blockers.push('Choose when you observed this.')
    }
  }

  if (step === 3) {
    if (!form.value.impact.trim()) {
      blockers.push('Describe the impact you noticed.')
    }
  }

  if (step === 4) {
    if (!hasAffirmedDeclaration.value) {
      blockers.push('Check the affirmation box.')
    }

    if (!form.value.signature_name.trim()) {
      blockers.push('Type your electronic signature (full legal name).')
    } else if (!signatureMatchesName.value) {
      blockers.push('Signature should include your first and last name.')
    }
  }

  return blockers
}

function getAllSubmitBlockers() {
  return observationStepTitles.flatMap((_, index) => getStepBlockers(index))
}

const currentStepBlockers = computed(() => getStepBlockers(observationStep.value))

function relationshipChipClass(suggestion: typeof relationshipSuggestions[number]) {
  const isSelected = form.value.relationship === suggestion.label

  if (isSelected) {
    if (suggestion.tone === 'partner') {
      return 'border-fuchsia-400 bg-fuchsia-500/25 text-fuchsia-100 ring-1 ring-fuchsia-400/50 dark:border-fuchsia-400 dark:bg-fuchsia-500/20 dark:text-fuchsia-100'
    }

    return 'border-slate-950 bg-slate-950 text-white dark:border-slate-500 dark:bg-slate-700 dark:text-slate-100'
  }

  if (suggestion.tone === 'partner') {
    return 'border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-700 hover:bg-fuchsia-500/15 dark:border-fuchsia-500/40 dark:bg-fuchsia-500/10 dark:text-fuchsia-200 dark:hover:bg-fuchsia-500/20'
  }

  return 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800'
}

watch(reporterFullName, (fullName) => {
  if (!signatureManuallyEdited.value && fullName) {
    form.value.signature_name = fullName
  }
})

watch(hasAffirmedDeclaration, (affirmed) => {
  if (affirmed && !form.value.signature_name.trim() && reporterFullName.value) {
    form.value.signature_name = reporterFullName.value
    signatureManuallyEdited.value = false
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
  signatureManuallyEdited.value = false
}

function showPreviousObservationStep() {
  if (observationStep.value > 0) {
    submitError.value = ''
    observationStep.value -= 1
  }
}

function tryAdvanceObservationStep() {
  if (!validateCurrentStep()) {
    return
  }

  if (!isLastObservationStep.value) {
    observationStep.value += 1
  }
}

function validateCurrentStep() {
  const blockers = getStepBlockers(observationStep.value)
  submitError.value = blockers[0] || ''
  return blockers.length === 0
}

function handleObservationPrimaryAction() {
  if (!validateCurrentStep()) {
    return
  }

  if (isLastObservationStep.value) {
    submitObservation()
    return
  }

  observationStep.value += 1
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
    submitError.value = getAllSubmitBlockers()[0] || 'Complete all required fields before submitting.'
    return
  }

  isSubmitting.value = true
  submitError.value = ''
  pageMessage.value = ''

  const { error } = await supabase.rpc('submit_supporter_observation', {
    link_token: token,
    condition_label: form.value.condition_label,
    observed_at: new Date(form.value.observed_at).toISOString(),
    severity: severityValue.value,
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
    severityValue.value = 5
    observationStep.value = 0
    resetReporterFields()
    setDefaultObservedAt()
  }

  isSubmitting.value = false
}
</script>

<style scoped>
.severity-guide-enter-active,
.severity-guide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.severity-guide-enter-from {
  opacity: 0;
  transform: translateY(0.35rem);
}

.severity-guide-leave-to {
  opacity: 0;
  transform: translateY(-0.35rem);
}
</style>
