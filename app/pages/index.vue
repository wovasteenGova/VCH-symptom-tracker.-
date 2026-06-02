<template>
  <main class="min-h-dvh bg-slate-950 text-white">
    <section class="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-6 pt-4 sm:max-w-lg">
      <header class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Today</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Symptom Tracker</h1>
        </div>

        <div v-if="isEntryOpen" class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            @click="closeEntryPanel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-sm"
            @click="closeEntryPanel(true)"
          >
            Done
          </button>
        </div>

        <div v-else class="flex items-center gap-2">
          <button
            v-if="hasActiveDraft"
            type="button"
            class="relative grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
            aria-label="Open active draft"
            @click="openEntryPanel"
          >
            <UIcon name="i-lucide-files" class="size-5" />
            <span class="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-slate-950" />
          </button>

          <button
            type="button"
            class="grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
            :aria-label="user ? 'Open account' : 'Sign in'"
            @click="toggleAuthPanel"
          >
            <UIcon :name="user ? 'i-lucide-user-check' : 'i-lucide-user-round'" class="size-5" />
          </button>
        </div>
      </header>

      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isAuthPanelOpen"
          class="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/70 px-4 pt-20 backdrop-blur-sm"
          @click.self="isAuthPanelOpen = false"
        >
          <section class="w-full max-w-md rounded-4xl border border-slate-800 bg-slate-900 p-4 shadow-2xl shadow-black/40">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {{ user ? 'Account' : authMode === 'login' ? 'Welcome back' : 'Create account' }}
                </p>
                <h2 class="mt-1 text-xl font-bold text-white">
                  {{ user ? user.email : authMode === 'login' ? 'Sign in to save entries' : 'Start saving your tracker' }}
                </h2>
              </div>

              <button
                type="button"
                class="grid size-9 place-items-center rounded-full bg-slate-800 text-slate-300"
                aria-label="Close account panel"
                @click="isAuthPanelOpen = false"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>

            <div v-if="user" class="mt-4">
              <button
                type="button"
                class="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950"
                @click="handleSignOut"
              >
                Sign out
              </button>
            </div>

            <form v-else class="mt-4 space-y-3" @submit.prevent="handleAuthSubmit">
            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Email</span>
              <input
                v-model="authEmail"
                type="email"
                autocomplete="email"
                class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                placeholder="you@example.com"
                required
              >
            </label>

            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Password</span>
              <input
                v-model="authPassword"
                type="password"
                autocomplete="current-password"
                class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                placeholder="At least 6 characters"
                required
              >
            </label>

            <button
              type="submit"
              class="w-full rounded-2xl bg-white px-4 py-4 text-base font-bold text-slate-950"
              :disabled="isAuthSubmitting"
            >
              {{ isAuthSubmitting ? 'Working...' : authMode === 'login' ? 'Sign in' : 'Create account' }}
            </button>

            <button
              type="button"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-4 text-base font-bold text-white ring-1 ring-slate-700 transition hover:bg-slate-700"
              :disabled="isAuthSubmitting"
              @click="handleGoogleSignIn"
            >
              <UIcon name="i-lucide-chrome" class="size-5" />
              Continue with Google
            </button>

            <button
              v-if="authMode === 'login'"
              type="button"
              class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-300"
              :disabled="isAuthSubmitting"
              @click="handleForgotPassword"
            >
              Forgot password?
            </button>

            <button
              type="button"
              class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-300"
              @click="authMode = authMode === 'login' ? 'signup' : 'login'"
            >
              {{ authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in' }}
            </button>

            <p v-if="authMessage" class="text-center text-sm font-medium text-slate-300">{{ authMessage }}</p>
            <p v-if="authError" class="text-center text-sm font-medium text-red-300">{{ authError }}</p>
            </form>
          </section>
        </div>
      </Transition>

      <section class="mt-6" :class="isEntryOpen ? 'flex flex-1 flex-col' : ''">
        <div class="relative" :class="isEntryOpen ? 'pb-0' : 'pb-10'">
          <div
            class="relative overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl shadow-black/30 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            :class="isEntryOpen ? 'h-[calc(100dvh-8rem)] rounded-[1.75rem]' : 'aspect-4/3 rounded-[2.25rem]'"
          >
            <Transition
              :enter-active-class="slideEnterActiveClass"
              :enter-from-class="slideEnterFromClass"
              enter-to-class="translate-y-0 opacity-100"
              :leave-active-class="slideLeaveActiveClass"
              leave-from-class="translate-y-0 opacity-100"
              :leave-to-class="slideLeaveToClass"
            >
              <div
                v-if="isEntryOpen"
                key="entry"
                class="absolute inset-0 flex h-full flex-col p-4"
              >
                <div class="flex items-center gap-3">
                  <img
                    :src="activeEntryImage"
                    :alt="entryTitle"
                    class="size-20 shrink-0 rounded-3xl object-cover"
                  >

                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">New Entry</p>
                    <h2 class="mt-1 truncate text-xl font-bold text-white">{{ entryTitle }}</h2>
                    <p class="mt-1 text-xs leading-5 text-slate-400">Fill the VA-useful details you know right now.</p>
                  </div>
                </div>

                <div class="mt-5 px-1">
                  <div class="mb-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      class="grid size-10 place-items-center rounded-full bg-slate-900 text-white ring-1 ring-slate-800 transition hover:bg-slate-800 disabled:opacity-30"
                      :disabled="entryStep === 0"
                      aria-label="Previous entry step"
                      @click="showPreviousEntryStep"
                    >
                      <UIcon name="i-lucide-chevron-left" class="size-5" />
                    </button>

                    <div class="min-w-0 flex-1">
                      <p class="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Step {{ entryStep + 1 }} of {{ entrySteps.length }}
                      </p>
                      <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          class="h-full rounded-full bg-white transition-all duration-300"
                          :style="{ width: entryProgressWidth }"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      class="grid size-10 place-items-center rounded-full bg-slate-900 text-white ring-1 ring-slate-800 transition hover:bg-slate-800 disabled:opacity-30"
                      :disabled="isLastEntryStep"
                      aria-label="Next entry step"
                      @click="showNextEntryStep"
                    >
                      <UIcon name="i-lucide-chevron-right" class="size-5" />
                    </button>
                  </div>

                  <Transition
                    mode="out-in"
                    enter-active-class="transition duration-300 ease-out"
                    enter-from-class="translate-x-4 opacity-0"
                    enter-to-class="translate-x-0 opacity-100"
                    leave-active-class="transition duration-200 ease-in"
                    leave-from-class="translate-x-0 opacity-100"
                    leave-to-class="-translate-x-4 opacity-0"
                  >
                    <div :key="entryStep" class="space-y-5 px-1">
                      <label
                        v-for="field in currentEntryStepFields"
                        :key="field.label"
                        class="block"
                      >
                        <span class="mb-2.5 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                          {{ field.label }}
                        </span>

                        <div
                          v-if="field.type === 'slider'"
                          class="rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4"
                        >
                          <div class="mb-4 flex items-center justify-between">
                            <span class="text-sm font-semibold text-slate-300">Mild</span>
                            <span class="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-950">
                              {{ severityValue }}/10
                            </span>
                            <span class="text-sm font-semibold text-slate-300">Severe</span>
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
                        </div>
                        <textarea
                          v-if="field.type === 'textarea'"
                          v-model="entryForm[fieldKey(field.label)]"
                          :placeholder="field.placeholder"
                          rows="3"
                          class="w-full resize-none rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                        />
                        <input
                          v-else-if="field.type !== 'slider'"
                          v-model="entryForm[fieldKey(field.label)]"
                          :type="field.type"
                          :placeholder="field.placeholder"
                          class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                        >
                      </label>
                    </div>
                  </Transition>
                </div>

                <div class="mt-auto pt-4">
                  <button
                    type="button"
                    class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"
                    :disabled="isSavingEntry"
                    @click="handleEntryPrimaryAction"
                  >
                    {{ isSavingEntry ? 'Saving...' : isLastEntryStep ? 'Finish' : 'Continue' }}
                    <UIcon :name="isLastEntryStep ? 'i-lucide-check' : 'i-lucide-arrow-right'" class="size-5" />
                  </button>
                  <p v-if="entryError" class="mt-3 text-center text-sm font-medium text-red-300">
                    {{ entryError }}
                  </p>
                </div>
              </div>

              <div
                v-else-if="isSearchSlide"
                key="search"
                class="absolute inset-0 flex h-full flex-col p-5"
              >
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  1 of {{ totalSlides }}
                </p>
                <h2 class="mt-1 text-2xl font-bold text-white">Find a condition</h2>

                <input
                  v-model="searchQuery"
                  type="search"
                  placeholder="Search symptoms or conditions"
                  class="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-semibold text-white outline-none placeholder:text-slate-500 focus:border-slate-500"
                >

                <div class="no-scrollbar mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
                  <button
                    v-for="result in filteredConditionResults"
                    :key="result.title"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-3xl bg-slate-800 p-2 text-left transition hover:bg-slate-700"
                  @click="selectSearchCondition(result)"
                  >
                    <img
                      :src="result.image"
                      :alt="result.title"
                      class="size-14 shrink-0 rounded-2xl object-cover"
                    >

                    <span class="min-w-0 flex-1">
                      <span class="block truncate font-bold text-white">{{ result.title }}</span>
                      <span class="mt-0.5 block truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        {{ result.category }}
                      </span>
                      <span class="mt-1 line-clamp-2 block text-xs leading-5 text-slate-300">
                        {{ result.description }}
                      </span>
                    </span>
                  </button>
                </div>
              </div>

              <div
                v-else
                :key="activeCondition.title"
                class="absolute inset-0"
                role="button"
                tabindex="0"
                :aria-label="`Start entry for ${activeCondition.title}`"
                data-clickable="true"
                @click="startEntryFromCurrentSlide"
                @keydown.enter.prevent="startEntryFromCurrentSlide"
                @keydown.space.prevent="startEntryFromCurrentSlide"
              >
                <img
                  :src="activeCondition.image"
                  :alt="activeCondition.title"
                  class="h-full w-full object-cover"
                >

                <div class="absolute inset-x-0 top-0 bg-linear-to-b from-black/70 via-black/20 to-transparent p-5 pb-16">
                  <div class="flex items-start justify-between gap-4">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                      {{ activeIndex + 1 }} of {{ totalSlides }}
                    </p>
                    <button
                      type="button"
                      class="grid size-10 place-items-center rounded-full bg-slate-950/70 text-white shadow-sm ring-1 ring-white/10 backdrop-blur transition hover:bg-slate-900"
                      aria-label="Search conditions"
                      @click.stop="goToSearch"
                    >
                      <UIcon name="i-lucide-search" class="size-5" />
                    </button>
                  </div>
                  <h2 class="mt-1 text-2xl font-bold text-white">{{ activeCondition.title }}</h2>
                </div>
              </div>
            </Transition>
          </div>

          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="translate-y-5 opacity-0"
            enter-to-class="translate-y-0 opacity-100"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="translate-y-0 opacity-100"
            leave-to-class="translate-y-5 opacity-0"
          >
          <div v-if="!isEntryOpen" class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-5">
            <button
              type="button"
              class="grid size-12 place-items-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-slate-950 transition hover:bg-slate-800"
              aria-label="Previous condition"
              @click="showPreviousCondition"
            >
              <UIcon name="i-lucide-chevron-left" class="size-6" />
            </button>

            <button
              type="button"
              class="grid size-20 place-items-center rounded-full bg-slate-800 text-white shadow-xl ring-4 ring-slate-950 transition hover:bg-slate-700"
              :aria-label="isSearchSlide ? 'Add custom condition' : `Add ${activeCondition.title} entry`"
              @click="startEntryFromCurrentSlide"
            >
              <UIcon name="i-lucide-plus" class="size-10" />
            </button>

            <button
              type="button"
              class="grid size-12 place-items-center rounded-full bg-slate-900 text-white shadow-lg ring-4 ring-slate-950 transition hover:bg-slate-800"
              aria-label="Next condition"
              @click="showNextCondition"
            >
              <UIcon name="i-lucide-chevron-right" class="size-6" />
            </button>
          </div>
          </Transition>
        </div>

        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="-translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-2 opacity-0"
        >
        <div v-if="!isEntryOpen" class="mt-2 flex justify-center gap-2">
          <button
            v-for="(_, index) in totalSlides"
            :key="index"
            type="button"
            class="h-2 rounded-full transition-all"
            :class="index === activeIndex ? 'w-7 bg-white' : 'w-2 bg-slate-700'"
            :aria-label="`Show condition ${index + 1}`"
            @click="showSlide(index)"
          />
        </div>
        </Transition>

      </section>

      <section v-if="!isEntryOpen" class="mt-7">
        <h2 class="text-2xl font-bold text-white">History</h2>

        <div class="mt-4 rounded-full bg-slate-900 p-1 shadow-sm">
          <div class="grid grid-cols-2 gap-1">
            <button
              v-for="tab in historyTabs"
              :key="tab"
              type="button"
              class="rounded-full px-4 py-3 text-sm font-semibold transition"
              :class="activeHistoryTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400'"
              @click="activeHistoryTab = tab"
            >
              {{ tab }}
            </button>
          </div>
        </div>

        <div v-if="activeHistoryTab === 'Entries'" class="mt-4 space-y-3">
          <div v-if="isLoadingEntries" class="rounded-[1.75rem] bg-slate-900 p-5 text-center text-sm text-slate-400">
            Loading entries...
          </div>
          <div v-else-if="entriesError" class="rounded-[1.75rem] bg-slate-900 p-5 text-center text-sm text-red-300">
            {{ entriesError }}
          </div>
          <div v-else-if="!historyEntries.length" class="rounded-[1.75rem] bg-slate-900 p-5 text-center">
            <p class="font-bold text-white">No entries yet</p>
            <p class="mt-1 text-sm text-slate-400">Tap a condition or use search to create your first log.</p>
          </div>
          <article
            v-for="entry in historyEntries"
            :key="entry.id"
            class="rounded-[1.75rem] bg-slate-900 p-3 shadow-sm"
          >
            <div class="flex items-center gap-3">
              <div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-800 text-center">
                <div>
                  <p class="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-400">{{ entry.month }}</p>
                  <p class="text-lg font-bold leading-none text-white">{{ entry.day }}</p>
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge color="neutral" variant="soft" size="sm">{{ entry.condition }}</UBadge>
                  <UBadge :color="entry.source === 'Family' ? 'info' : 'primary'" variant="soft" size="sm">
                    {{ entry.source }}
                  </UBadge>
                </div>

                <h3 class="mt-2 truncate font-bold text-white">{{ entry.title }}</h3>
                <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                  <span class="inline-flex items-center gap-1">
                    <UIcon name="i-lucide-clock-3" class="size-3.5" />
                    {{ entry.time }}
                  </span>
                  <span class="text-slate-700">•</span>
                  <span>{{ entry.summary }}</span>
                </div>
              </div>

              <div
                class="grid size-12 shrink-0 place-items-center rounded-full"
                :class="entry.statusColor"
              >
                <button
                  type="button"
                  :aria-label="`Delete ${entry.title}`"
                  @click="removeEntry(entry.id)"
                >
                  <UIcon :name="entry.statusIcon" class="size-7" />
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="mt-4 rounded-4xl bg-slate-900 p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <button
              type="button"
              class="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-800"
              aria-label="Previous month"
            >
              <UIcon name="i-lucide-chevron-left" class="size-4" />
            </button>

            <p class="font-bold text-white">January 2024</p>

            <button
              type="button"
              class="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-800"
              aria-label="Next month"
            >
              <UIcon name="i-lucide-chevron-right" class="size-4" />
            </button>
          </div>

          <div class="mt-4 grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
            <span v-for="day in weekDays" :key="day">{{ day }}</span>
          </div>

          <div class="mt-3 grid grid-cols-7 gap-y-3 text-center">
            <div
              v-for="day in calendarDays"
              :key="day.key"
              class="flex justify-center"
            >
              <button
                type="button"
                class="grid size-8 place-items-center rounded-full text-xs font-bold"
                :class="day.entry ? day.color : day.currentMonth ? 'text-slate-400' : 'text-slate-700'"
                :aria-label="day.entry ? `${day.label} has an entry` : day.label"
              >
                <UIcon v-if="day.entry" :name="day.icon" class="size-5" />
                <span v-else>{{ day.date }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer v-if="!isEntryOpen" class="mt-auto pt-6">
        <p class="text-center text-xs leading-5 text-slate-500">
          Weekly reflection stays default. Use the add button when an episode or flare-up should be logged now.
        </p>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '../composables/useSupabaseAuth'
import { useSymptomEntries } from '../composables/useSymptomEntries'
import { computed, onMounted, ref, watch } from 'vue'

const {
  user,
  authError,
  signIn,
  signUp,
  signInWithGoogle,
  sendPasswordReset,
  signOut
} = useSupabaseAuth()

const activeIndex = ref(0)
const activeHistoryTab = ref('Entries')
const isEntryOpen = ref(false)
const isAuthPanelOpen = ref(false)
const authMode = ref<'login' | 'signup'>('login')
const authEmail = ref('')
const authPassword = ref('')
const authMessage = ref('')
const isAuthSubmitting = ref(false)
const hasActiveDraft = ref(false)
const entryStep = ref(0)
const severityValue = ref(5)
const entryForm = ref<Record<string, string>>({})
const isSavingEntry = ref(false)
const entryError = ref('')
const isLoadingEntries = ref(false)
const entriesError = ref('')
const savedEntries = ref<any[]>([])
const transitionDirection = ref('next')
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedSearchCondition = ref<null | {
  title: string
  category: string
  description: string
  image: string
}>(null)

const historyTabs = ['Entries', 'Calendar']

const conditionImages = [
  '/image/ptsd-mental-health.png',
  '/image/back-joint-pain.png',
  '/image/nerve-radiculopathy.png',
  '/image/migraine-headache.png',
  '/image/gerd-ibs.png',
  '/image/sleep-issues.png'
]

const conditions = [
  {
    title: 'PTSD / Mental Health',
    image: conditionImages[0]
  },
  {
    title: 'Back or Joint Pain',
    image: conditionImages[1]
  },
  {
    title: 'Nerve / Radiculopathy',
    image: conditionImages[2]
  },
  {
    title: 'Migraine / Headache',
    image: conditionImages[3]
  },
  {
    title: 'GERD / IBS',
    image: conditionImages[4]
  },
  {
    title: 'Sleep Issues',
    image: conditionImages[5]
  }
]

const conditionResults = [
  {
    title: 'Migraine',
    category: 'Neurological',
    description: 'Frequency, duration, severity, triggers, and prostrating episodes.',
    image: conditionImages[0]
  },
  {
    title: 'Tension headaches',
    category: 'Neurological',
    description: 'Headache pattern, pain level, work impact, and medication use.',
    image: conditionImages[1]
  },
  {
    title: 'Vertigo / Dizziness',
    category: 'Neurological',
    description: 'Dizzy spells, falls, nausea, balance issues, and missed activity.',
    image: conditionImages[0]
  },
  {
    title: 'Seizures',
    category: 'Neurological',
    description: 'Episode timing, recovery, injuries, witnesses, and daily impact.',
    image: conditionImages[1]
  },
  {
    title: 'PTSD',
    category: 'Mental Health',
    description: 'Nightmares, flashbacks, panic, isolation, irritability, and missed work.',
    image: conditionImages[0]
  },
  {
    title: 'Anxiety',
    category: 'Mental Health',
    description: 'Triggers, panic symptoms, avoidance, sleep, and social impact.',
    image: conditionImages[1]
  },
  {
    title: 'Depression',
    category: 'Mental Health',
    description: 'Mood, motivation, hygiene, isolation, sleep, and daily functioning.',
    image: conditionImages[0]
  },
  {
    title: 'Panic attacks',
    category: 'Mental Health',
    description: 'Immediate episode logs for panic symptoms, duration, and recovery.',
    image: conditionImages[1]
  },
  {
    title: 'Insomnia / Sleep disturbances',
    category: 'Sleep',
    description: 'Hours slept, wake-ups, nightmares, fatigue, and next-day effects.',
    image: conditionImages[0]
  },
  {
    title: 'Lower back pain',
    category: 'Back, Neck, and Joint',
    description: 'Pain level, flare-ups, limits sitting, standing, walking, and lifting.',
    image: conditionImages[1]
  },
  {
    title: 'Neck pain',
    category: 'Back, Neck, and Joint',
    description: 'Range of motion, flare-ups, pain level, and activity limits.',
    image: conditionImages[0]
  },
  {
    title: 'Knee conditions',
    category: 'Back, Neck, and Joint',
    description: 'Pain, swelling, instability, walking limits, stairs, and missed activity.',
    image: conditionImages[1]
  },
  {
    title: 'Shoulder conditions',
    category: 'Back, Neck, and Joint',
    description: 'Pain, range of motion, lifting limits, sleep interruption, and flare-ups.',
    image: conditionImages[0]
  },
  {
    title: 'Arthritis',
    category: 'Back, Neck, and Joint',
    description: 'Joint pain, stiffness, flare-ups, movement limits, and medication use.',
    image: conditionImages[1]
  },
  {
    title: 'Radiculopathy',
    category: 'Nerve',
    description: 'Left/right symptoms, numbness, tingling, burning, weakness, and falls.',
    image: conditionImages[0]
  },
  {
    title: 'Sciatica',
    category: 'Nerve',
    description: 'Radiating pain, leg weakness, numbness, sitting limits, and flare-ups.',
    image: conditionImages[1]
  },
  {
    title: 'Peripheral neuropathy',
    category: 'Nerve',
    description: 'Numbness, tingling, burning, weakness, walking issues, and falls.',
    image: conditionImages[0]
  },
  {
    title: 'GERD',
    category: 'Digestive',
    description: 'Heartburn, regurgitation, medication, sleep interruption, and diet triggers.',
    image: conditionImages[1]
  },
  {
    title: 'IBS',
    category: 'Digestive',
    description: 'Pain, diarrhea, constipation, urgency, missed activity, and triggers.',
    image: conditionImages[0]
  },
  {
    title: 'Chronic diarrhea',
    category: 'Digestive',
    description: 'Frequency, urgency, dehydration, medication, and daily interruptions.',
    image: conditionImages[1]
  },
  {
    title: 'Constipation',
    category: 'Digestive',
    description: 'Frequency, pain, medication, diet triggers, and functional impact.',
    image: conditionImages[0]
  },
  {
    title: 'Asthma',
    category: 'Respiratory',
    description: 'Shortness of breath, rescue inhaler use, attacks, and triggers.',
    image: conditionImages[1]
  },
  {
    title: 'Sleep apnea',
    category: 'Respiratory',
    description: 'Sleep problems, fatigue, CPAP use, headaches, and daytime impact.',
    image: conditionImages[0]
  },
  {
    title: 'Sinusitis',
    category: 'Respiratory',
    description: 'Congestion, headaches, flare-ups, infections, medication, and missed activity.',
    image: conditionImages[1]
  },
  {
    title: 'Rhinitis',
    category: 'Respiratory',
    description: 'Congestion, runny nose, sneezing, breathing issues, and triggers.',
    image: conditionImages[0]
  },
  {
    title: 'Eczema',
    category: 'Skin',
    description: 'Area affected, itching, flare-ups, treatment, and photos later.',
    image: conditionImages[1]
  },
  {
    title: 'Psoriasis',
    category: 'Skin',
    description: 'Area affected, plaques, itching, flare-ups, treatment, and photos later.',
    image: conditionImages[0]
  },
  {
    title: 'Dermatitis',
    category: 'Skin',
    description: 'Rash location, itching, triggers, flare-ups, treatment, and photos later.',
    image: conditionImages[1]
  },
  {
    title: 'Fibromyalgia',
    category: 'Chronic Pain / Fatigue',
    description: 'Pain, fatigue, brain fog, flare-ups, and days unable to function normally.',
    image: conditionImages[0]
  },
  {
    title: 'Chronic fatigue',
    category: 'Chronic Pain / Fatigue',
    description: 'Fatigue level, brain fog, rest needs, and functional limitations.',
    image: conditionImages[1]
  }
]

const historyEntries = computed(() => {
  return savedEntries.value.map((entry) => {
    const entryDate = entry.occurred_at ? new Date(entry.occurred_at) : new Date(entry.created_at)

    return {
      id: entry.id,
      month: entryDate.toLocaleString('en-US', { month: 'short' }),
      day: entryDate.toLocaleString('en-US', { day: '2-digit' }),
      condition: entry.condition_label,
      source: entry.source === 'family' ? 'Family' : 'Veteran',
      title: entry.summary || entry.condition_label,
      summary: entry.impact || 'No impact note added',
      time: entryDate.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      }),
      statusIcon: entry.severity >= 7 ? 'i-lucide-frown' : entry.severity >= 4 ? 'i-lucide-meh' : 'i-lucide-smile',
      statusColor: entry.severity >= 7
        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
        : entry.severity >= 4
          ? 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    }
  })
})

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const calendarDays = computed(() => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1
  const days = []

  for (let index = 0; index < mondayOffset; index += 1) {
    days.push({
      key: `empty-${index}`,
      date: '',
      label: 'Empty calendar day',
      currentMonth: false,
      entry: false
    })
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const matchingEntry = savedEntries.value.find((entry) => {
      const entryDate = entry.occurred_at ? new Date(entry.occurred_at) : new Date(entry.created_at)
      return entryDate.getFullYear() === year && entryDate.getMonth() === month && entryDate.getDate() === day
    })
    const severity = matchingEntry?.severity ?? null

    days.push({
      key: `${year}-${month}-${day}`,
      date: day,
      label: new Date(year, month, day).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      }),
      currentMonth: true,
      entry: Boolean(matchingEntry),
      icon: severity !== null && severity >= 7 ? 'i-lucide-frown' : severity !== null && severity >= 4 ? 'i-lucide-meh' : 'i-lucide-smile',
      color: severity !== null && severity >= 7
        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
        : severity !== null && severity >= 4
          ? 'bg-stone-200 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
    })
  }

  return days
})

const defaultEntryFields = [
  {
    label: 'Date and time',
    type: 'datetime-local',
    placeholder: ''
  },
  {
    label: 'Severity 0-10',
    type: 'slider',
    placeholder: ''
  },
  {
    label: 'What happened?',
    type: 'textarea',
    placeholder: 'Short note about the symptom, episode, or flare-up.'
  },
  {
    label: 'Daily impact',
    type: 'textarea',
    placeholder: 'Missed work, family activity, sleep, errands, walking, lifting, or other limits.'
  }
]

const entryFieldsByCondition = {
  'PTSD / Mental Health': [
    ...defaultEntryFields,
    {
      label: 'Episode type',
      type: 'text',
      placeholder: 'Panic, nightmare, flashback, isolation, irritability...'
    },
    {
      label: 'Safety note',
      type: 'textarea',
      placeholder: 'Optional: anything important to remember or discuss with care team.'
    }
  ],
  'Back or Joint Pain': [
    ...defaultEntryFields,
    {
      label: 'Movement limit',
      type: 'text',
      placeholder: 'Sitting, standing, walking, lifting, bending...'
    },
    {
      label: 'Flare-up trigger',
      type: 'text',
      placeholder: 'Driving, stairs, lifting groceries, weather, unknown...'
    }
  ],
  'Nerve / Radiculopathy': [
    ...defaultEntryFields,
    {
      label: 'Side affected',
      type: 'text',
      placeholder: 'Left, right, both, arm, leg, foot...'
    },
    {
      label: 'Nerve symptoms',
      type: 'textarea',
      placeholder: 'Numbness, tingling, burning, weakness, falls, radiating pain.'
    }
  ],
  'Migraine / Headache': [
    ...defaultEntryFields,
    {
      label: 'Duration',
      type: 'text',
      placeholder: 'Example: 4 hours'
    },
    {
      label: 'Prostrating episode?',
      type: 'text',
      placeholder: 'Did you need to lie down, avoid light/noise, or stop activity?'
    }
  ],
  'GERD / IBS': [
    ...defaultEntryFields,
    {
      label: 'Digestive symptom',
      type: 'text',
      placeholder: 'Heartburn, regurgitation, diarrhea, constipation, urgency...'
    },
    {
      label: 'Medication or food trigger',
      type: 'text',
      placeholder: 'Medication used, meal trigger, or unknown.'
    }
  ],
  'Sleep Issues': [
    ...defaultEntryFields,
    {
      label: 'Hours slept',
      type: 'number',
      placeholder: 'Example: 4'
    },
    {
      label: 'Sleep interruption',
      type: 'textarea',
      placeholder: 'Nightmares, wake-ups, pain, reflux, panic, breathing issues, fatigue.'
    }
  ]
}

const totalSlides = computed(() => conditions.length + 1)
const isSearchSlide = computed(() => activeIndex.value === 0)
const activeCondition = computed(() => conditions[Math.max(activeIndex.value - 1, 0)])
const entryTitle = computed(() => {
  if (isSearchSlide.value) {
    return selectedSearchCondition.value?.title || 'Custom condition'
  }

  return activeCondition.value.title
})
const activeEntryImage = computed(() => {
  if (isSearchSlide.value) {
    return selectedSearchCondition.value?.image || conditionImages[0]
  }

  return activeCondition.value.image
})
const activeEntryFields = computed(() => {
  if (isSearchSlide.value) {
    if (selectedSearchCondition.value) {
      return getEntryFieldsForSearchCondition(selectedSearchCondition.value)
    }

    return [
      {
        label: 'Condition name',
        type: 'text',
        placeholder: 'Example: tinnitus, sinusitis, skin flare-up...'
      },
      ...defaultEntryFields
    ]
  }

  return entryFieldsByCondition[activeCondition.value.title] || defaultEntryFields
})
const entrySteps = computed(() => {
  const fieldsPerStep = 2
  const steps = []

  for (let index = 0; index < activeEntryFields.value.length; index += fieldsPerStep) {
    steps.push(activeEntryFields.value.slice(index, index + fieldsPerStep))
  }

  return steps
})
const currentEntryStepFields = computed(() => entrySteps.value[entryStep.value] || [])
const isLastEntryStep = computed(() => entryStep.value >= entrySteps.value.length - 1)
const entryProgressWidth = computed(() => {
  if (!entrySteps.value.length) {
    return '0%'
  }

  return `${((entryStep.value + 1) / entrySteps.value.length) * 100}%`
})
const slideEnterActiveClass = computed(() => {
  if (transitionDirection.value === 'expand') {
    return 'transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
  }

  return 'transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
})
const slideLeaveActiveClass = computed(() => {
  if (transitionDirection.value === 'expand') {
    return 'transition duration-0'
  }

  return 'transition duration-300 ease-[cubic-bezier(0.55,0,1,0.45)]'
})
const slideEnterFromClass = computed(() => {
  if (transitionDirection.value === 'expand') {
    return 'translate-y-0 opacity-100'
  }

  if (transitionDirection.value === 'previous') {
    return 'translate-x-8 opacity-0'
  }

  if (transitionDirection.value === 'next') {
    return '-translate-x-8 opacity-0'
  }

  if (transitionDirection.value === 'collapse') {
    return '-translate-y-3 opacity-0'
  }

  return 'translate-y-3 opacity-0'
})
const slideLeaveToClass = computed(() => {
  if (transitionDirection.value === 'expand') {
    return 'translate-y-0 opacity-0'
  }

  if (transitionDirection.value === 'previous') {
    return '-translate-x-8 opacity-0'
  }

  if (transitionDirection.value === 'next') {
    return 'translate-x-8 opacity-0'
  }

  if (transitionDirection.value === 'collapse') {
    return 'translate-y-3 opacity-0'
  }

  return '-translate-y-3 opacity-0'
})
const filteredConditionResults = computed(() => {
  const query = debouncedSearchQuery.value.trim().toLowerCase()

  if (!query) {
    return conditionResults
  }

  return conditionResults.filter((condition) => {
    const searchableText = [
      condition.title,
      condition.category,
      condition.description
    ].join(' ').toLowerCase()

    return searchableText.includes(query)
  })
})

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(searchQuery, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    debouncedSearchQuery.value = value
  }, 250)
})

onMounted(() => {
  if (user.value) {
    loadEntries()
  }
})

watch(user, (currentUser) => {
  if (currentUser) {
    isAuthPanelOpen.value = false
    loadEntries()
    return
  }

  savedEntries.value = []
})

function fieldKey(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function resetEntryForm() {
  entryForm.value = {}
  severityValue.value = 5

  const now = new Date()
  const timezoneOffset = now.getTimezoneOffset() * 60000
  entryForm.value.date_and_time = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16)
}

function conditionKey(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

async function loadEntries() {
  if (!user.value) {
    savedEntries.value = []
    return
  }

  isLoadingEntries.value = true
  entriesError.value = ''

  try {
    const { listEntries } = useSymptomEntries()
    savedEntries.value = await listEntries()
  } catch (error) {
    entriesError.value = getErrorMessage(error)
  } finally {
    isLoadingEntries.value = false
  }
}

async function saveEntry() {
  if (!user.value) {
    entryError.value = 'Please sign in before saving symptom entries.'
    isAuthPanelOpen.value = true
    return
  }

  isSavingEntry.value = true
  entryError.value = ''

  try {
    const { createEntry } = useSymptomEntries()
    const details = { ...entryForm.value }
    const occurredAt = entryForm.value.date_and_time
      ? new Date(entryForm.value.date_and_time).toISOString()
      : null

    await createEntry({
      condition_key: conditionKey(entryTitle.value),
      condition_label: entryTitle.value,
      severity: severityValue.value,
      occurred_at: occurredAt,
      summary: entryForm.value.what_happened || entryForm.value.condition_name || entryTitle.value,
      impact: entryForm.value.daily_impact || null,
      details
    })

    hasActiveDraft.value = false
    closeEntryPanel(true)
    await loadEntries()
  } catch (error) {
    entryError.value = getErrorMessage(error)
  } finally {
    isSavingEntry.value = false
  }
}

async function removeEntry(id: string) {
  if (!user.value) {
    entriesError.value = 'Please sign in before deleting symptom entries.'
    isAuthPanelOpen.value = true
    return
  }

  entriesError.value = ''

  try {
    const { deleteEntry } = useSymptomEntries()
    await deleteEntry(id)
    await loadEntries()
  } catch (error) {
    entriesError.value = getErrorMessage(error)
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

function toggleAuthPanel() {
  isAuthPanelOpen.value = !isAuthPanelOpen.value
}

async function handleAuthSubmit() {
  isAuthSubmitting.value = true
  authMessage.value = ''

  try {
    if (authMode.value === 'login') {
      await signIn(authEmail.value, authPassword.value)
    } else {
      const data = await signUp(authEmail.value, authPassword.value)

      if (data.user) {
        authMessage.value = data.session
          ? 'Account created. You are signed in.'
          : 'Account created. Check your email to confirm before signing in.'
      } else {
        authMessage.value = 'Signup did not return a user. Check Supabase Auth settings and try again.'
      }
    }
  } catch {
    // useSupabaseAuth exposes the message in authError.
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleGoogleSignIn() {
  isAuthSubmitting.value = true
  authMessage.value = ''

  try {
    await signInWithGoogle()
  } catch {
    // useSupabaseAuth exposes the message in authError.
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleForgotPassword() {
  if (!authEmail.value) {
    authMessage.value = 'Enter your email first, then tap Forgot password again.'
    return
  }

  isAuthSubmitting.value = true
  authMessage.value = ''

  try {
    await sendPasswordReset(authEmail.value)
    authMessage.value = 'Password reset email sent.'
  } catch {
    // useSupabaseAuth exposes the message in authError.
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleSignOut() {
  await signOut()
  isAuthPanelOpen.value = false
  hasActiveDraft.value = false
  closeEntryPanel(true)
}

function showPreviousCondition() {
  transitionDirection.value = 'previous'
  closeEntryPanel()
  activeIndex.value = activeIndex.value === 0 ? totalSlides.value - 1 : activeIndex.value - 1
}

function showNextCondition() {
  transitionDirection.value = 'next'
  closeEntryPanel()
  activeIndex.value = activeIndex.value === totalSlides.value - 1 ? 0 : activeIndex.value + 1
}

function showSlide(index: number) {
  if (index === activeIndex.value) {
    return
  }

  if (index !== 0) {
    selectedSearchCondition.value = null
  }

  transitionDirection.value = index > activeIndex.value ? 'next' : 'previous'
  closeEntryPanel()
  activeIndex.value = index
}

function goToSearch() {
  showSlide(0)
}

function getEntryFieldsForSearchCondition(condition: { title: string, category: string }) {
  const title = condition.title.toLowerCase()
  const category = condition.category.toLowerCase()

  if (category.includes('mental')) {
    return entryFieldsByCondition['PTSD / Mental Health']
  }

  if (category.includes('back') || title.includes('arthritis') || title.includes('knee') || title.includes('shoulder')) {
    return entryFieldsByCondition['Back or Joint Pain']
  }

  if (category.includes('nerve') || title.includes('sciatica') || title.includes('neuropathy')) {
    return entryFieldsByCondition['Nerve / Radiculopathy']
  }

  if (category.includes('neurological') || title.includes('migraine') || title.includes('headache') || title.includes('vertigo')) {
    return entryFieldsByCondition['Migraine / Headache']
  }

  if (category.includes('digestive') || title.includes('gerd') || title.includes('ibs')) {
    return entryFieldsByCondition['GERD / IBS']
  }

  if (category.includes('sleep') || title.includes('sleep')) {
    return entryFieldsByCondition['Sleep Issues']
  }

  return defaultEntryFields
}

function selectSearchCondition(condition: { title: string, category: string, description: string, image: string }) {
  selectedSearchCondition.value = condition
  openEntryPanel()
}

function startEntryFromCurrentSlide() {
  if (isSearchSlide.value) {
    selectedSearchCondition.value = null
  }

  openEntryPanel()
}

function openEntryPanel() {
  if (!user.value) {
    isAuthPanelOpen.value = true
    return
  }

  transitionDirection.value = 'expand'
  entryStep.value = 0
  resetEntryForm()
  hasActiveDraft.value = true
  isEntryOpen.value = true
}

function closeEntryPanel(clearDraft = false) {
  if (isEntryOpen.value) {
    transitionDirection.value = 'collapse'
  }

  if (clearDraft) {
    hasActiveDraft.value = false
  }

  isEntryOpen.value = false
}

function showPreviousEntryStep() {
  if (entryStep.value > 0) {
    entryStep.value -= 1
  }
}

function showNextEntryStep() {
  if (!isLastEntryStep.value) {
    entryStep.value += 1
  }
}

function handleEntryPrimaryAction() {
  if (isLastEntryStep.value) {
    saveEntry()
    return
  }

  showNextEntryStep()
}
</script>
