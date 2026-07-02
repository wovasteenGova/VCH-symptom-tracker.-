<template>
  <main class="h-dvh max-h-dvh overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white">
    <section class="mx-auto flex h-full max-h-dvh w-full max-w-md flex-col overflow-hidden pt-4 pb-0 sm:max-w-lg">
      <header class="flex shrink-0 items-center justify-between gap-3 px-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Today</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Symptom Tracker</h1>
        </div>

        <div v-if="isEntryOpen" class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="closeEntryPanel"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-950"
            @click="closeEntryPanel(true)"
          >
            Done
          </button>
        </div>

        <div v-else class="flex items-center gap-2">
          <button
            v-if="hasActiveDraft"
            type="button"
            class="relative grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800"
            aria-label="Open active draft"
            @click="openEntryPanel"
          >
            <UIcon name="i-lucide-files" class="size-5" />
            <span class="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-slate-950" />
          </button>

          <UColorModeSwitch
            size="md"
            color="primary"
            class="header-color-toggle"
          />

          <button
            type="button"
            class="grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800"
            :aria-label="user ? 'Open account' : 'Sign in'"
            @click="handleProfileClick"
          >
            <UIcon :name="user ? 'i-lucide-user-check' : 'i-lucide-user-round'" class="size-5" />
          </button>
        </div>
      </header>

      <section
        v-if="showInstallCard && !isEntryOpen"
        class="mx-4 mt-5 shrink-0 rounded-4xl border border-teal-200 bg-teal-50 p-4 shadow-lg shadow-teal-950/5 dark:border-teal-500/30 dark:bg-teal-950/30 dark:shadow-black/20"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-200">Install on phone</p>
            <h2 class="mt-1 text-lg font-bold text-slate-950 dark:text-white">Use this like an app</h2>
          </div>

          <button
            type="button"
            class="grid size-8 shrink-0 place-items-center rounded-full bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-300 dark:ring-0"
            aria-label="Dismiss install instructions"
            @click="dismissInstallCard"
          >
            <UIcon name="i-lucide-x" class="size-4" />
          </button>
        </div>

        <p class="mt-3 text-sm leading-6 text-teal-950/90 dark:text-teal-50/90">
          {{ installInstructionText }}
        </p>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            v-if="canPromptInstall"
            type="button"
            class="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-950"
            @click="promptInstall"
          >
            Install app
          </button>

          <NuxtLink
            to="/install"
            class="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 ring-1 ring-teal-200 dark:bg-slate-900/80 dark:text-white dark:ring-teal-500/30"
          >
            How to install
          </NuxtLink>
        </div>
      </section>

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
          class="fixed inset-0 z-50 flex items-start justify-center bg-slate-200/70 px-4 pt-20 backdrop-blur-sm dark:bg-slate-950/70"
          @click.self="isAuthPanelOpen = false"
        >
          <section class="w-full max-w-md rounded-4xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {{ user ? 'Account' : authMode === 'login' ? 'Welcome back' : 'Create account' }}
                </p>
                <h2 class="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                  {{ user ? user.email : authMode === 'login' ? 'Sign in to save entries' : 'Start saving your tracker' }}
                </h2>
              </div>

              <button
                type="button"
                class="grid size-9 place-items-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
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
                :disabled="isAuthSubmitting"
                @click="handleSignOut"
              >
                {{ isAuthSubmitting ? 'Signing out...' : 'Sign out' }}
              </button>
              <p v-if="authError" class="mt-3 text-center text-sm font-medium text-red-300">{{ authError }}</p>
            </div>

            <form v-else class="mt-4 space-y-3" @submit.prevent="handleAuthSubmit">
            <label v-if="authMode === 'signup'" class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Name</span>
              <input
                v-model="authName"
                type="text"
                autocomplete="name"
                class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400"
                placeholder="Your full name"
                required
              >
            </label>

            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Email</span>
              <input
                v-model="authEmail"
                type="email"
                autocomplete="email"
                class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400"
                placeholder="you@example.com"
                required
              >
            </label>

            <label v-if="authMode === 'signup'" class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Confirm password</span>
              <input
                v-model="authConfirmPassword"
                type="password"
                autocomplete="new-password"
                class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400"
                placeholder="Re-enter password"
                required
              >
            </label>

            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Password</span>
              <input
                v-model="authPassword"
                type="password"
                autocomplete="current-password"
                class="w-full rounded-3xl border border-slate-300 bg-white px-4 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400"
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
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-4 text-base font-bold text-slate-950 ring-1 ring-slate-200 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
              :disabled="isAuthSubmitting"
              @click="handleGoogleSignIn"
            >
              <UIcon name="i-lucide-chrome" class="size-5" />
              Continue with Google
            </button>

            <button
              v-if="authMode === 'login'"
              type="button"
              class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300"
              :disabled="isAuthSubmitting"
              @click="handleForgotPassword"
            >
              Forgot password?
            </button>

            <button
              type="button"
              class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300"
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

      <section v-if="isEntryOpen" class="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div class="flex min-h-0 flex-1 flex-col overflow-hidden px-5">
          <Transition
            :enter-active-class="slideEnterActiveClass"
            :enter-from-class="slideEnterFromClass"
            enter-to-class="translate-y-0 opacity-100"
            :leave-active-class="slideLeaveActiveClass"
            leave-from-class="translate-y-0 opacity-100"
            :leave-to-class="slideLeaveToClass"
          >
            <div
              key="entry"
              class="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div class="mb-6 shrink-0 flex items-center gap-4">
                  <img
                    :src="activeEntryImage"
                    :alt="entryTitle"
                    class="size-16 shrink-0 rounded-2xl object-cover"
                  >

                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">New Entry</p>
                    <div class="mt-1.5 flex items-center gap-2">
                      <h2 class="min-w-0 truncate text-xl font-bold text-slate-950 dark:text-white">{{ entryTitle }}</h2>
                      <button
                        type="button"
                        class="grid size-8 shrink-0 place-items-center rounded-full transition"
                        :class="isConditionPickerOpen
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'"
                        :aria-label="isConditionPickerOpen ? 'Close condition picker' : 'Change condition'"
                        :aria-expanded="isConditionPickerOpen"
                        @click="toggleConditionPicker"
                      >
                        <UIcon name="i-lucide-pencil" class="size-4" />
                      </button>
                    </div>
                    <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Log what you know right now.</p>
                  </div>
                </div>

              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="-translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-1 opacity-0"
              >
                <div
                  v-if="isConditionPickerOpen"
                  class="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                  <div class="border-b border-slate-200 px-3 py-3 dark:border-slate-800">
                    <label class="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Custom condition
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="customConditionInput"
                        type="text"
                        placeholder="Example: tinnitus, sinusitis, skin flare-up..."
                        class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-slate-500"
                        @keydown.enter.prevent="applyCustomEntryCondition"
                      >
                      <button
                        type="button"
                        class="inline-flex shrink-0 items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                        :disabled="!customConditionInput.trim()"
                        @click="applyCustomEntryCondition"
                      >
                        Use
                      </button>
                    </div>
                  </div>

                  <div class="border-b border-slate-200 px-3 py-2 dark:border-slate-800">
                    <p class="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                      Or pick from the list
                    </p>
                  </div>

                  <div class="no-scrollbar max-h-52 space-y-0.5 overflow-y-auto p-2">
                    <button
                      v-for="result in conditionResults"
                      :key="result.title"
                      type="button"
                      class="flex w-full items-center gap-2.5 rounded-xl p-2 text-left transition"
                      :class="result.title === entryTitle
                        ? 'bg-slate-100 ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/80'"
                      @click="changeEntryCondition(result)"
                    >
                      <img
                        :src="result.image"
                        :alt="result.title"
                        class="size-10 shrink-0 rounded-xl object-cover"
                      >

                      <span class="min-w-0 flex-1">
                        <span class="block truncate text-sm font-bold text-slate-950 dark:text-white">{{ result.title }}</span>
                        <span class="mt-0.5 block truncate text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                          {{ result.category }}
                        </span>
                      </span>

                      <UIcon
                        v-if="result.title === entryTitle"
                        name="i-lucide-check"
                        class="size-4 shrink-0 text-slate-950 dark:text-white"
                      />
                    </button>
                  </div>
                </div>
              </Transition>

              <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div class="relative z-10 mb-6 shrink-0 flex items-center justify-between gap-4 bg-slate-50 px-1 dark:bg-slate-950">
                    <button
                      type="button"
                      class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
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
                      <div class="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                          class="h-full rounded-full bg-slate-950 transition-all duration-300 dark:bg-white"
                          :style="{ width: entryProgressWidth }"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-950 transition hover:bg-slate-200 disabled:opacity-30 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                      :disabled="isLastEntryStep"
                      aria-label="Next entry step"
                      @click="showNextEntryStep"
                    >
                      <UIcon name="i-lucide-chevron-right" class="size-5" />
                    </button>
                  </div>

                  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
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
                        :key="entryStep"
                        class="flex min-h-0 flex-1 flex-col"
                        :class="currentStepHasSliderField() && currentEntryStepFields.length === 1
                          ? 'justify-center px-1 py-4'
                          : currentStepIsEpisodeDetailStep()
                            ? 'mt-8 justify-start space-y-12 overflow-y-auto no-scrollbar pt-2'
                            : 'mt-6 justify-start space-y-6 overflow-y-auto no-scrollbar'"
                      >
                        <label
                          v-for="(field, fieldIndex) in currentEntryStepFields"
                          :key="field.label"
                          class="block w-full"
                          :class="fieldIndex > 0 && isEpisodeFollowUpField(field)
                            ? 'border-t border-slate-200/80 pt-10 dark:border-slate-700/80'
                            : ''"
                        >
                          <span
                            v-if="field.type !== 'datetime' && field.type !== 'slider'"
                            class="mb-4 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
                            :class="isEpisodeDurationField(field) || isEpisodeFollowUpField(field) ? 'mb-5' : ''"
                          >
                            {{ field.label }}
                          </span>

                          <div
                            v-if="field.type === 'slider'"
                            class="w-full space-y-5"
                          >
                            <div class="space-y-1 text-center">
                              <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                How much did today affect you?
                              </p>
                              <p class="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                Slide between a best day and a worst day for this condition.
                              </p>
                            </div>

                            <div class="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <span>Best day</span>
                              <span>Worst day</span>
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
                                  ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'"
                                @click="applySeverityPreset(preset.value)"
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
                                  <p class="text-sm font-bold text-slate-950 dark:text-white">
                                    {{ severityGuidance.title }}
                                  </p>
                                  <p class="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                                    {{ severityGuidance.text }}
                                  </p>
                                </div>
                              </Transition>
                            </div>
                          </div>

                          <div
                            v-else-if="field.type === 'datetime'"
                            class="space-y-4"
                          >
                          <div class="flex items-start justify-between gap-3">
                            <div class="min-w-0 flex-1">
                              <span class="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                When did this happen?
                              </span>
                              <p class="text-sm leading-6 font-medium text-slate-950 dark:text-white">
                                {{ entryDateTimePreview }}
                              </p>
                            </div>
                            <button
                              type="button"
                              class="relative z-10 inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-slate-100 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                              @click="setEntryDateTimeNow"
                            >
                              <UIcon name="i-lucide-clock-3" class="size-3.5" />
                              Now
                            </button>
                          </div>

                          <div class="space-y-4">
                            <div class="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                aria-label="Previous month"
                                @click="showPreviousEntryPickerMonth"
                              >
                                <UIcon name="i-lucide-chevron-left" class="size-4" />
                              </button>
                              <p class="min-w-[8rem] text-center text-sm font-bold text-slate-950 dark:text-white">
                                {{ entryPickerMonthLabel }}
                              </p>
                              <button
                                type="button"
                                class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                                aria-label="Next month"
                                :disabled="!canShowNextEntryPickerMonth"
                                @click="showNextEntryPickerMonth"
                              >
                                <UIcon name="i-lucide-chevron-right" class="size-4" />
                              </button>
                            </div>

                            <div class="grid grid-cols-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                              <span v-for="day in weekDays" :key="`entry-${day}`">{{ day }}</span>
                            </div>

                            <div class="grid grid-cols-7 gap-y-2 text-center">
                              <div
                                v-for="day in entryPickerDays"
                                :key="day.key"
                                class="flex justify-center"
                              >
                                <button
                                  v-if="day.dayNumber"
                                  type="button"
                                  class="grid size-8 place-items-center rounded-full text-xs font-bold transition"
                                  :class="day.selected
                                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                                    : day.selectable
                                      ? 'text-slate-950 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800'
                                      : 'cursor-not-allowed text-slate-300 dark:text-slate-600'"
                                  :disabled="!day.selectable"
                                  :aria-label="day.label"
                                  :aria-pressed="day.selected"
                                  @click="selectEntryPickerDay(day)"
                                >
                                  {{ day.dayNumber }}
                                </button>
                              </div>
                            </div>

                            <div class="mt-6 space-y-3">
                              <p class="text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                                Time
                              </p>
                              <div class="grid grid-cols-3 gap-3">
                                <USelectMenu
                                  v-model="entryTimeHour"
                                  :items="entryHourOptions"
                                  :ui="entryTimeSelectUi"
                                  color="neutral"
                                  variant="ghost"
                                  size="md"
                                  aria-label="Hour"
                                  class="sym-entry-time-menu w-full"
                                  :popper="{ strategy: 'fixed' }"
                                  @update:model-value="onEntryTimePartsChange"
                                />
                                <USelectMenu
                                  v-model="entryTimeMinute"
                                  :items="entryMinuteOptions"
                                  :ui="entryTimeSelectUi"
                                  color="neutral"
                                  variant="ghost"
                                  size="md"
                                  aria-label="Minute"
                                  class="sym-entry-time-menu w-full"
                                  :popper="{ strategy: 'fixed' }"
                                  @update:model-value="onEntryTimePartsChange"
                                />
                                <USelectMenu
                                  v-model="entryTimePeriod"
                                  :items="entryPeriodOptions"
                                  :ui="entryTimeSelectUi"
                                  color="neutral"
                                  variant="ghost"
                                  size="md"
                                  aria-label="AM or PM"
                                  class="sym-entry-time-menu w-full"
                                  :popper="{ strategy: 'fixed' }"
                                  @update:model-value="onEntryTimePartsChange"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div
                          v-else-if="isEpisodeDurationField(field) || isEpisodeFollowUpField(field)"
                          class="space-y-5"
                        >
                          <div class="flex flex-wrap gap-2.5">
                            <button
                              v-for="preset in getEntryFieldPresets(field.label)"
                              :key="preset.label"
                              type="button"
                              class="rounded-full px-3 py-1.5 text-xs font-bold transition"
                              :class="entryForm[fieldKey(field.label)] === preset.value
                                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
                              @click="applyEntryFieldPreset(field.label, preset.value)"
                            >
                              {{ preset.label }}
                            </button>
                          </div>
                          <input
                            v-model="entryForm[fieldKey(field.label)]"
                            type="text"
                            :placeholder="field.placeholder"
                            class="w-full border-0 bg-transparent px-0 py-3 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
                          >
                        </div>
                        <textarea
                          v-else-if="field.type === 'textarea'"
                          v-model="entryForm[fieldKey(field.label)]"
                          :placeholder="field.placeholder"
                          rows="4"
                          class="w-full resize-none border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:text-white dark:focus:border-slate-400"
                        />
                        <input
                          v-else-if="field.type !== 'slider' && field.type !== 'datetime' && !isEpisodeDurationField(field) && !isEpisodeFollowUpField(field)"
                          v-model="entryForm[fieldKey(field.label)]"
                          :type="field.type"
                          :placeholder="field.placeholder"
                          class="w-full border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:text-white dark:focus:border-slate-400"
                        >
                      </label>
                      </div>
                    </Transition>
                  </div>
              </div>

              <div class="mt-auto shrink-0 pt-8 pb-6">
                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
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
          </Transition>
        </div>
      </section>

      <div
        v-else
        class="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div
          class="shrink-0 px-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          :class="historyExpanded ? 'pb-1' : 'pb-2'"
          @wheel.passive="handleConditionWheel"
          @touchstart.passive="handleConditionTouchStart"
          @touchmove.passive="handleConditionTouchMove"
        >
          <div class="relative flex min-h-0 flex-col">
            <div
              class="relative w-full shrink-0 overflow-hidden rounded-[1.75rem] transition-[height,max-height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              :class="historyExpanded ? 'h-[42dvh]' : 'h-[54dvh]'"
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
                  v-if="isSearchSlide"
                  key="search"
                  class="absolute inset-0 flex h-full flex-col px-2 pt-4 pb-24"
                >
                  <p class="px-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    1 of {{ totalSlides }}
                  </p>

                  <input
                    v-model="searchQuery"
                    type="search"
                    placeholder="Find a condition or + custom"
                    class="mt-3 w-full border-0 border-b border-slate-300/80 bg-transparent px-1 py-3 text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
                  >

                  <div class="relative mt-4 min-h-0 flex-1">
                    <div
                      ref="conditionScrollEl"
                      class="no-scrollbar h-full space-y-3 overflow-y-auto px-1"
                      @scroll="handleConditionScroll"
                    >
                      <button
                        v-for="result in filteredConditionResults"
                        :key="result.title"
                        type="button"
                        class="flex w-full items-start gap-4 rounded-2xl px-3 py-4 text-left transition hover:bg-slate-100 active:scale-[0.99] dark:hover:bg-slate-800/80"
                        @click="selectSearchCondition(result)"
                      >
                        <img
                          :src="result.image"
                          :alt="result.title"
                          class="size-16 shrink-0 rounded-2xl object-cover"
                        >

                        <span class="min-w-0 flex-1 py-0.5">
                          <span class="block text-lg font-bold leading-snug text-slate-950 dark:text-white">
                            {{ result.title }}
                          </span>
                          <span class="mt-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                            {{ result.category }}
                          </span>
                          <span class="mt-2 block text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {{ result.description }}
                          </span>
                        </span>
                      </button>
                    </div>

                    <div
                      v-if="filteredConditionResults.length > 2"
                      class="pointer-events-none absolute inset-x-0 bottom-0 flex h-10 items-end justify-center bg-linear-to-t from-white via-white/80 to-transparent pb-1 dark:from-slate-950 dark:via-slate-950/80"
                    >
                      <span class="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                        Scroll for more
                      </span>
                    </div>
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

              <div
                class="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pb-1 pt-6"
                :class="isSearchSlide
                  ? 'bg-linear-to-t from-white via-white/95 to-transparent dark:from-slate-950 dark:via-slate-950/95'
                  : 'bg-linear-to-t from-slate-950 via-slate-950/90 to-transparent'"
              >
                <div class="pointer-events-auto flex flex-col items-center gap-1.5">
                  <div class="flex justify-center gap-2">
                    <button
                      v-for="(_, index) in totalSlides"
                      :key="index"
                      type="button"
                      class="h-2 rounded-full transition-all"
                      :class="[
                        index === activeIndex ? 'w-7' : 'w-2',
                        isSearchSlide
                          ? (index === activeIndex ? 'bg-slate-950 dark:bg-white' : 'bg-slate-300 dark:bg-white/35')
                          : (index === activeIndex ? 'bg-white' : 'bg-white/35'),
                      ]"
                      :aria-label="`Show condition ${index + 1}`"
                      @click="showSlide(index)"
                    />
                  </div>

                  <div class="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      class="grid size-11 place-items-center rounded-full bg-white text-slate-950 shadow-lg transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                      aria-label="Previous condition"
                      @click="showPreviousCondition"
                    >
                      <UIcon name="i-lucide-chevron-left" class="size-5" />
                    </button>

                    <button
                      type="button"
                      class="grid size-[4.5rem] place-items-center rounded-full bg-white text-slate-950 shadow-xl transition hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                      :class="historyExpanded ? 'scale-90' : 'scale-100'"
                      :aria-label="isSearchSlide ? 'Add custom condition' : `Add ${activeCondition.title} entry`"
                      @click="startEntryFromCurrentSlide"
                    >
                      <UIcon name="i-lucide-plus" class="size-9" />
                    </button>

                    <button
                      type="button"
                      class="grid size-11 place-items-center rounded-full bg-white text-slate-950 shadow-lg transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                      aria-label="Next condition"
                      @click="showNextCondition"
                    >
                      <UIcon name="i-lucide-chevron-right" class="size-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section
          class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[1.75rem] border-t border-slate-200/80 bg-white transition-[flex] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-slate-800 dark:bg-slate-900"
        >
          <button
            type="button"
            class="flex w-full shrink-0 justify-center py-2.5"
            :aria-label="historyExpanded ? 'Collapse history' : 'Expand history'"
            @click="toggleHistoryExpanded"
          >
            <span class="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
          </button>

          <div class="shrink-0 px-4">
            <div class="flex items-start justify-between gap-3">
              <h2 class="text-2xl font-bold text-slate-950 dark:text-white">History</h2>
              <button
                type="button"
                class="inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950 disabled:opacity-40 dark:text-slate-300 dark:hover:text-white"
                :disabled="!savedEntries.length || isExportingPdf"
                @click="exportEntriesPdf"
              >
                <UIcon name="i-lucide-download" class="size-4" />
                {{ isExportingPdf ? 'Exporting...' : 'PDF' }}
              </button>
            </div>
            <p v-if="exportError" class="mt-2 text-sm font-medium text-red-600 dark:text-red-300">
              {{ exportError }}
            </p>

            <div class="mt-4 rounded-full bg-slate-100 p-1 dark:bg-slate-800/80">
              <div class="grid grid-cols-2 gap-1">
                <button
                  v-for="tab in historyTabs"
                  :key="tab"
                  type="button"
                  class="rounded-full px-4 py-3 text-sm font-semibold transition"
                  :class="activeHistoryTab === tab ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'"
                  @click="activeHistoryTab = tab"
                >
                  {{ tab }}
                </button>
              </div>
            </div>
          </div>

          <div
            ref="historyScrollEl"
            class="min-h-0 flex-1 overscroll-contain px-4 pb-2 pt-3 no-scrollbar"
            :class="historyExpanded ? 'overflow-y-auto' : 'overflow-hidden touch-pan-y'"
            @scroll="handleHistoryScroll"
            @wheel="handleHistoryWheel"
            @touchstart.passive="handleHistoryTouchStart"
            @touchmove.passive="handleHistoryTouchMove"
          >
            <div v-if="activeHistoryTab === 'Entries'" class="divide-y divide-slate-200 dark:divide-slate-800">
              <div v-if="isLoadingEntries" class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Loading entries...
              </div>
              <div v-else-if="entriesError" class="py-8 text-center text-sm text-red-600 dark:text-red-300">
                {{ entriesError }}
              </div>
              <div v-else-if="!historyEntries.length" class="py-8 text-center">
                <p class="font-bold text-slate-950 dark:text-white">No entries yet</p>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">Tap a condition or use search to create your first log.</p>
              </div>
              <article
                v-for="entry in historyEntries"
                :key="entry.id"
                class="py-3"
              >
                <div class="flex items-center gap-3">
                  <div class="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-100 text-center dark:bg-slate-800">
                    <div>
                      <p class="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{{ entry.month }}</p>
                      <p class="text-lg font-bold leading-none text-slate-950 dark:text-white">{{ entry.day }}</p>
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge color="neutral" variant="soft" size="sm">{{ entry.condition }}</UBadge>
                      <UBadge :color="entry.source === 'Family' ? 'info' : 'primary'" variant="soft" size="sm">
                        {{ entry.source }}
                      </UBadge>
                    </div>

                    <h3 class="mt-2 truncate font-bold text-slate-950 dark:text-white">{{ entry.title }}</h3>
                    <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span class="inline-flex items-center gap-1">
                        <UIcon name="i-lucide-clock-3" class="size-3.5" />
                        {{ entry.time }}
                      </span>
                      <span class="text-slate-300 dark:text-slate-700">•</span>
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

            <div v-else class="py-1">
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Previous month"
                  @click="showPreviousHistoryMonth"
                >
                  <UIcon name="i-lucide-chevron-left" class="size-4" />
                </button>

                <p class="font-bold text-slate-950 dark:text-white">{{ historyMonthLabel }}</p>

                <button
                  type="button"
                  class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Next month"
                  :disabled="!canShowNextHistoryMonth"
                  @click="showNextHistoryMonth"
                >
                  <UIcon name="i-lucide-chevron-right" class="size-4" />
                </button>
              </div>

              <div class="mt-4 grid grid-cols-7 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                    class="relative grid size-8 place-items-center rounded-full text-xs font-bold"
                    :class="day.entry ? day.color : day.currentMonth ? 'text-slate-400' : 'text-slate-700'"
                    :aria-label="day.entry ? `${day.label} has ${day.entryCount} ${day.entryCount === 1 ? 'entry' : 'entries'}` : day.label"
                  >
                    <span v-if="day.entry" class="relative inline-flex">
                      <UIcon :name="day.icon" class="size-5" />
                      <span
                        v-if="day.entryCount > 1"
                        class="absolute -right-1.5 -top-1.5 grid min-w-[0.85rem] place-items-center rounded-full bg-slate-950 px-0.5 text-[0.55rem] font-bold leading-none text-white dark:bg-white dark:text-slate-950"
                      >
                        {{ day.entryCount }}
                      </span>
                    </span>
                    <span v-else>{{ day.date }}</span>
                  </button>
                </div>
              </div>
            </div>

            <p class="mt-4 text-center text-xs leading-5 text-slate-500">
              Swipe up on history to expand.
            </p>
            <div class="mt-2 flex items-center justify-center gap-3 pb-1 text-xs font-semibold text-slate-500">
              <NuxtLink to="/install" class="hover:text-slate-700 dark:hover:text-slate-300">Install</NuxtLink>
              <NuxtLink to="/privacy" class="hover:text-slate-700 dark:hover:text-slate-300">Privacy</NuxtLink>
              <NuxtLink to="/disclaimer" class="hover:text-slate-700 dark:hover:text-slate-300">Disclaimer</NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '../composables/useSupabaseAuth'
import { useSymptomEntries } from '../composables/useSymptomEntries'
import { useSymptomPdfExport } from '../composables/useSymptomPdfExport'
import {
  calendarDateToDateString,
  clampTime24ToMax,
  coerceCalendarDate,
  dateStringToCalendarDate,
  formatEntryDateTimePreview,
  formatPartsToTime24,
  getMaxEntryDateTimeLocal,
  getMaxEntryTimeLocal,
  getMinEntryCalendarDate,
  getTodayCalendarDate,
  isFutureEntryDateTime,
  parseTime24ToParts,
  splitEntryDateTimeLocal
} from '../utils/symptomDateTime'
import { getEntryFieldPresets } from '../utils/entryFieldPresets'
import { getSeverityGuidance, severityQuickPresets } from '../utils/severityGuidance'
import { CalendarDate } from '@internationalized/date'
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'

const {
  user,
  authError,
  signIn,
  signUp,
  signInWithGoogle,
  sendPasswordReset,
  signOut
} = useSupabaseAuth()
const router = useRouter()

const activeIndex = ref(0)
const activeHistoryTab = ref('Entries')
const isEntryOpen = ref(false)
const isConditionPickerOpen = ref(false)
const customConditionInput = ref('')
const isAuthPanelOpen = ref(false)
const authMode = ref<'login' | 'signup'>('login')
const authName = ref('')
const authEmail = ref('')
const authPassword = ref('')
const authConfirmPassword = ref('')
const authMessage = ref('')
const isAuthSubmitting = ref(false)
const hasActiveDraft = ref(false)
const entryStep = ref(0)
const severityValue = ref(5)

const severityGuidance = computed(() => getSeverityGuidance(severityValue.value))
const entryForm = ref<Record<string, string>>({})
const isSavingEntry = ref(false)
const entryError = ref('')
const isLoadingEntries = ref(false)
const entriesError = ref('')
const savedEntries = ref<any[]>([])
const isExportingPdf = ref(false)
const exportError = ref('')
const transitionDirection = ref('next')
const showInstallCard = ref(false)
const installPlatform = ref<'ios' | 'android' | 'desktop'>('desktop')
const deferredInstallPrompt = ref<any>(null)
const historyExpanded = ref(false)
const historyScrollEl = ref<HTMLElement | null>(null)
const conditionScrollEl = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedSearchCondition = ref<null | {
  title: string
  category: string
  description: string
  image: string
}>(null)

const { downloadEntriesPdf } = useSymptomPdfExport()

const initialEntryDateTime = splitEntryDateTimeLocal(getMaxEntryDateTimeLocal())
const initialEntryTimeParts = parseTime24ToParts(initialEntryDateTime.time)
const entryCalendarDate = shallowRef<CalendarDate | undefined>(
  import.meta.client ? dateStringToCalendarDate(initialEntryDateTime.date) : undefined
)
const entryTimeInput = ref(initialEntryDateTime.time)
const entryTimeHour = ref(initialEntryTimeParts.hour12)
const entryTimeMinute = ref(initialEntryTimeParts.minute)
const entryTimePeriod = ref<'AM' | 'PM'>(initialEntryTimeParts.period)
const entryPickerViewMonth = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})

const entryHourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1))
const entryMinuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))
const entryPeriodOptions = ['AM', 'PM']
const entryTimeSelectUi = {
  base: 'w-full justify-center border-0 ring-0 shadow-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
  content: 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700',
  item: 'dark:text-white'
}

const maxEntryTimeInput = computed(() => {
  if (!entryCalendarDate.value) {
    return '23:59'
  }

  return getMaxEntryTimeLocal(calendarDateToDateString(entryCalendarDate.value))
})

const entryDateTimePreview = computed(() => {
  return formatEntryDateTimePreview(entryForm.value.date_and_time || '')
})

const entryPickerMonthLabel = computed(() => {
  return new Date(entryPickerViewMonth.value.year, entryPickerViewMonth.value.month, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const canShowNextEntryPickerMonth = computed(() => {
  const now = new Date()
  const view = entryPickerViewMonth.value

  return view.year < now.getFullYear()
    || (view.year === now.getFullYear() && view.month < now.getMonth())
})

const entryPickerDays = computed(() => {
  const year = entryPickerViewMonth.value.year
  const month = entryPickerViewMonth.value.month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const mondayOffset = firstDay === 0 ? 6 : firstDay - 1
  const selectedDate = coerceCalendarDate(entryCalendarDate.value)
  const days = []

  for (let index = 0; index < mondayOffset; index += 1) {
    days.push({
      key: `entry-empty-${year}-${month}-${index}`,
      dayNumber: 0,
      selectable: false,
      selected: false,
      label: 'Empty calendar day'
    })
  }

  for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
    const calendarDate = new CalendarDate(year, month + 1, dayNumber)
    const minDate = getMinEntryCalendarDate()
    const maxDate = getTodayCalendarDate()
    const selectable = calendarDate.compare(minDate) >= 0 && calendarDate.compare(maxDate) <= 0
    const selected = selectedDate
      ? selectedDate.year === calendarDate.year
        && selectedDate.month === calendarDate.month
        && selectedDate.day === calendarDate.day
      : false

    days.push({
      key: `entry-${year}-${month}-${dayNumber}`,
      year,
      month,
      dayNumber,
      selectable,
      selected,
      label: new Date(year, month, dayNumber).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    })
  }

  return days
})

const historyTabs = ['Entries', 'Calendar']
const installDismissedKey = 'symptom-tracker-install-dismissed'

// TEMP: local testing fallback while auth checks are commented out below.
const localEntriesKey = 'symptom-tracker-local-entries'

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
    description: 'Frequency, duration, severity, triggers, and daily impact.',
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

const historyViewMonth = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})

const historyMonthLabel = computed(() => {
  return new Date(historyViewMonth.value.year, historyViewMonth.value.month, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric'
  })
})

const canShowNextHistoryMonth = computed(() => {
  const now = new Date()
  const view = historyViewMonth.value

  return view.year < now.getFullYear()
    || (view.year === now.getFullYear() && view.month < now.getMonth())
})

function showPreviousHistoryMonth() {
  const view = historyViewMonth.value

  if (view.month === 0) {
    historyViewMonth.value = { year: view.year - 1, month: 11 }
    return
  }

  historyViewMonth.value = { year: view.year, month: view.month - 1 }
}

function showNextHistoryMonth() {
  if (!canShowNextHistoryMonth.value) {
    return
  }

  const view = historyViewMonth.value

  if (view.month === 11) {
    historyViewMonth.value = { year: view.year + 1, month: 0 }
    return
  }

  historyViewMonth.value = { year: view.year, month: view.month + 1 }
}

const calendarDays = computed(() => {
  const year = historyViewMonth.value.year
  const month = historyViewMonth.value.month
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
    const matchingEntries = savedEntries.value.filter((entry) => {
      const entryDate = entry.occurred_at ? new Date(entry.occurred_at) : new Date(entry.created_at)
      return entryDate.getFullYear() === year && entryDate.getMonth() === month && entryDate.getDate() === day
    })
    const entryCount = matchingEntries.length
    const severity = entryCount
      ? matchingEntries.reduce((highest, entry) => Math.max(highest, entry.severity ?? 0), 0)
      : null

    days.push({
      key: `${year}-${month}-${day}`,
      date: day,
      label: new Date(year, month, day).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric'
      }),
      currentMonth: true,
      entry: entryCount > 0,
      entryCount,
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
    type: 'datetime',
    placeholder: ''
  },
  {
    label: 'How bad was it?',
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

const durationField = {
  label: 'Duration',
  type: 'text',
  placeholder: 'Example: 30 minutes, 4 hours, all day'
}

const episodeDurationField = {
  label: 'Episode duration',
  type: 'text',
  placeholder: 'Example: 20 minutes, 2 hours, most of the day'
}

const stopActivityField = {
  label: 'Had to stop activity?',
  type: 'text',
  placeholder: 'Lie down, leave work, cancel plans, or avoid movement?'
}

const sleepLimitField = {
  label: 'Kept you from sleeping?',
  type: 'text',
  placeholder: 'Hard to fall asleep, stay asleep, or get useful rest?'
}

const episodeTypeField = {
  label: 'Episode type',
  type: 'text',
  placeholder: 'Panic, nightmare, flashback, isolation, irritability...'
}

type EntryFieldDef = {
  label: string
  type: string
  placeholder: string
  stepRole?: 'duration' | 'followUp'
}

type ConditionEpisodeConfig = {
  duration: Omit<EntryFieldDef, 'stepRole'>
  followUp?: Omit<EntryFieldDef, 'stepRole'>
}

const conditionEpisodeConfig: Record<string, ConditionEpisodeConfig> = {
  'Migraine / Headache': {
    duration: durationField
  },
  'PTSD / Mental Health': {
    duration: episodeDurationField,
    followUp: episodeTypeField
  },
  'Back or Joint Pain': {
    duration: durationField,
    followUp: stopActivityField
  },
  'Nerve / Radiculopathy': {
    duration: durationField,
    followUp: stopActivityField
  },
  'Sleep Issues': {
    duration: durationField,
    followUp: sleepLimitField
  }
}

function buildEntryFields(conditionTitle: string, extraFields: Array<Record<string, string>> = []) {
  const fields: EntryFieldDef[] = [
    defaultEntryFields[0] as EntryFieldDef,
    defaultEntryFields[1] as EntryFieldDef
  ]

  const episodeConfig = conditionEpisodeConfig[conditionTitle]
  if (episodeConfig) {
    fields.push({ ...episodeConfig.duration, stepRole: 'duration' })
    if (episodeConfig.followUp) {
      fields.push({ ...episodeConfig.followUp, stepRole: 'followUp' })
    }
  }

  fields.push(
    defaultEntryFields[2] as EntryFieldDef,
    defaultEntryFields[3] as EntryFieldDef,
    ...(extraFields as EntryFieldDef[])
  )

  return fields
}

function isEpisodeDurationField(field: { stepRole?: string }) {
  return field.stepRole === 'duration'
}

function isEpisodeFollowUpField(field: { stepRole?: string }) {
  return field.stepRole === 'followUp'
}

const entryFieldsByCondition = {
  'PTSD / Mental Health': buildEntryFields('PTSD / Mental Health', [
    {
      label: 'Safety note',
      type: 'textarea',
      placeholder: 'Optional: anything important to remember or discuss with care team.'
    }
  ]),
  'Back or Joint Pain': buildEntryFields('Back or Joint Pain', [
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
  ]),
  'Nerve / Radiculopathy': buildEntryFields('Nerve / Radiculopathy', [
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
  ]),
  'Migraine / Headache': buildEntryFields('Migraine / Headache'),
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
  'Sleep Issues': buildEntryFields('Sleep Issues', [
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
  ])
}

const totalSlides = computed(() => conditions.length + 1)
const isSearchSlide = computed(() => activeIndex.value === 0)
const activeCondition = computed(() => conditions[Math.max(activeIndex.value - 1, 0)])
const entryTitle = computed(() => {
  if (selectedSearchCondition.value) {
    return selectedSearchCondition.value.title
  }

  const customName = entryForm.value.condition_name?.trim()
  if (customName) {
    return customName
  }

  if (isSearchSlide.value) {
    return 'Custom condition'
  }

  return activeCondition.value.title
})
const activeEntryImage = computed(() => {
  if (selectedSearchCondition.value?.image) {
    return selectedSearchCondition.value.image
  }

  if (isSearchSlide.value) {
    return conditionImages[0]
  }

  return activeCondition.value.image
})
const activeEntryFields = computed(() => {
  if (selectedSearchCondition.value) {
    return getEntryFieldsForSearchCondition(selectedSearchCondition.value)
  }

  const customName = entryForm.value.condition_name?.trim()
  if (customName || isSearchSlide.value) {
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
  const fields = activeEntryFields.value
  const steps = []
  let index = 0

  while (index < fields.length) {
    const field = fields[index]

    if (field.type === 'datetime' || field.type === 'slider') {
      steps.push([field])
      index += 1
      continue
    }

    if (isEpisodeDurationField(field)) {
      const nextField = fields[index + 1]
      if (nextField && isEpisodeFollowUpField(nextField)) {
        steps.push([field, nextField])
        index += 2
      } else {
        steps.push([field])
        index += 1
      }
      continue
    }

    if (isEpisodeFollowUpField(field)) {
      steps.push([field])
      index += 1
      continue
    }

    steps.push(fields.slice(index, index + 2))
    index += 2
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
function filterConditionResults(query: string) {
  const normalized = query.trim().toLowerCase()

  if (!normalized) {
    return conditionResults
  }

  return conditionResults.filter((condition) => {
    const searchableText = [
      condition.title,
      condition.category,
      condition.description
    ].join(' ').toLowerCase()

    return searchableText.includes(normalized)
  })
}

const filteredConditionResults = computed(() => filterConditionResults(debouncedSearchQuery.value))
const canPromptInstall = computed(() => Boolean(deferredInstallPrompt.value))
const installInstructionText = computed(() => {
  if (installPlatform.value === 'ios') {
    return 'On iPhone: open this in Safari, tap the Share button, then tap Add to Home Screen.'
  }

  if (installPlatform.value === 'android') {
    return canPromptInstall.value
      ? 'On Android: tap Install app, or use Chrome menu > Add to Home screen.'
      : 'On Android: open Chrome menu, then tap Add to Home screen or Install app.'
  }

  return 'Open this link on your phone, then add it to your home screen for the app-like experience.'
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
  setupInstallCard()
  loadEntries()

  if (!entryCalendarDate.value) {
    syncEntryInputsFromForm()
  }

  // if (user.value) {
  //   loadEntries()
  // }
})

watch(user, (currentUser) => {
  if (currentUser) {
    isAuthPanelOpen.value = false
    loadEntries()
    return
  }

  // savedEntries.value = []
  loadEntries() // TEMP: load local entries while auth is disabled
})

function fieldKey(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function syncEntryPickerViewMonth() {
  const calendarDate = coerceCalendarDate(entryCalendarDate.value)

  if (!calendarDate) {
    return
  }

  entryPickerViewMonth.value = {
    year: calendarDate.year,
    month: calendarDate.month - 1
  }
}

function showPreviousEntryPickerMonth() {
  const view = entryPickerViewMonth.value

  if (view.month === 0) {
    entryPickerViewMonth.value = { year: view.year - 1, month: 11 }
    return
  }

  entryPickerViewMonth.value = { year: view.year, month: view.month - 1 }
}

function showNextEntryPickerMonth() {
  if (!canShowNextEntryPickerMonth.value) {
    return
  }

  const view = entryPickerViewMonth.value

  if (view.month === 11) {
    entryPickerViewMonth.value = { year: view.year + 1, month: 0 }
    return
  }

  entryPickerViewMonth.value = { year: view.year, month: view.month + 1 }
}

function selectEntryPickerDay(day: {
  dayNumber: number
  month: number
  selectable: boolean
  year: number
}) {
  if (!day.selectable || !day.dayNumber) {
    return
  }

  onEntryCalendarUpdate(new CalendarDate(day.year, day.month + 1, day.dayNumber))
}

function applySeverityPreset(value: number) {
  severityValue.value = value
}

function applyEntryFieldPreset(label: string, value: string) {
  entryForm.value[fieldKey(label)] = value
}

function refreshEntryDateLimits() {
  // Future-date validation runs when syncing or validating the step.
}

function resetEntryForm() {
  refreshEntryDateLimits()
  entryForm.value = {}
  severityValue.value = 5
  entryForm.value.date_and_time = getMaxEntryDateTimeLocal()
  syncEntryInputsFromForm()
}

function syncEntryInputsFromForm() {
  const { date, time } = splitEntryDateTimeLocal(
    entryForm.value.date_and_time || getMaxEntryDateTimeLocal()
  )
  entryTimeInput.value = time
  syncEntryTimePartsFromInput()

  if (import.meta.client) {
    entryCalendarDate.value = coerceCalendarDate(dateStringToCalendarDate(date))
    syncEntryPickerViewMonth()
  }
}

function syncEntryFormFromInputs() {
  const calendarDate = coerceCalendarDate(entryCalendarDate.value)

  if (!calendarDate || !entryTimeInput.value) {
    return
  }

  entryCalendarDate.value = calendarDate

  const dateTimeValue = `${calendarDateToDateString(calendarDate)}T${entryTimeInput.value}`

  if (isFutureEntryDateTime(dateTimeValue)) {
    setEntryDateTimeNow()
    return
  }

  entryForm.value.date_and_time = dateTimeValue
}

function onEntryCalendarUpdate(date: unknown) {
  const calendarDate = coerceCalendarDate(date)

  if (!calendarDate) {
    return
  }

  entryCalendarDate.value = calendarDate
  const dateStr = calendarDateToDateString(calendarDate)
  const maxTime = getMaxEntryTimeLocal(dateStr)

  if (entryTimeInput.value > maxTime) {
    entryTimeInput.value = maxTime
    syncEntryTimePartsFromInput()
  }

  syncEntryFormFromInputs()
}

function syncEntryTimePartsFromInput() {
  const parts = parseTime24ToParts(entryTimeInput.value)
  entryTimeHour.value = parts.hour12
  entryTimeMinute.value = parts.minute
  entryTimePeriod.value = parts.period
}

function onEntryTimePartsChange() {
  const nextTime = formatPartsToTime24(
    entryTimeHour.value,
    entryTimeMinute.value,
    entryTimePeriod.value
  )
  entryTimeInput.value = clampTime24ToMax(nextTime, maxEntryTimeInput.value)
  syncEntryTimePartsFromInput()
  syncEntryFormFromInputs()
}

function setEntryDateTimeNow() {
  refreshEntryDateLimits()
  entryForm.value.date_and_time = getMaxEntryDateTimeLocal()
  syncEntryInputsFromForm()
}

function clampEntryDateTimeField() {
  syncEntryFormFromInputs()
}

function currentStepHasDateTimeField() {
  return currentEntryStepFields.value.some((field) => field.type === 'datetime')
}

function currentStepHasSliderField() {
  return currentEntryStepFields.value.some((field) => field.type === 'slider')
}

function currentStepIsEpisodeDetailStep() {
  const fields = currentEntryStepFields.value
  return fields.some((field) => isEpisodeDurationField(field))
    && fields.some((field) => isEpisodeFollowUpField(field))
}

function validateEntryDateTimeStep() {
  clampEntryDateTimeField()

  if (!entryForm.value.date_and_time) {
    entryError.value = 'Choose when this happened.'
    return false
  }

  if (isFutureEntryDateTime(entryForm.value.date_and_time)) {
    entryError.value = 'Date and time cannot be in the future.'
    return false
  }

  entryError.value = ''
  return true
}

async function exportEntriesPdf() {
  isExportingPdf.value = true
  exportError.value = ''

  try {
    await downloadEntriesPdf(savedEntries.value)
  } catch (error) {
    exportError.value = getErrorMessage(error)
  } finally {
    isExportingPdf.value = false
  }
}

function conditionKey(label: string) {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function setupInstallCard() {
  if (typeof window === 'undefined') {
    return
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || (navigator as any).standalone === true

  if (isStandalone || window.localStorage.getItem(installDismissedKey) === 'true') {
    return
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(userAgent)
  const isAndroid = /android/.test(userAgent)

  installPlatform.value = isIos ? 'ios' : isAndroid ? 'android' : 'desktop'
  showInstallCard.value = true

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredInstallPrompt.value = event
    installPlatform.value = 'android'
    showInstallCard.value = true
  })

  window.addEventListener('appinstalled', () => {
    showInstallCard.value = false
    deferredInstallPrompt.value = null
    window.localStorage.setItem(installDismissedKey, 'true')
  })
}

function dismissInstallCard() {
  showInstallCard.value = false

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(installDismissedKey, 'true')
  }
}

async function promptInstall() {
  if (!deferredInstallPrompt.value) {
    return
  }

  deferredInstallPrompt.value.prompt()
  await deferredInstallPrompt.value.userChoice
  deferredInstallPrompt.value = null
}

function readLocalEntries() {
  if (!import.meta.client) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(localEntriesKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeLocalEntries(entries: any[]) {
  if (!import.meta.client) {
    return
  }

  window.localStorage.setItem(localEntriesKey, JSON.stringify(entries))
}

async function loadEntries() {
  // if (!user.value) {
  //   savedEntries.value = []
  //   return
  // }

  // TEMP: local testing fallback while auth is disabled
  if (!user.value) {
    savedEntries.value = readLocalEntries()
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
  // if (!user.value) {
  //   entryError.value = 'Please sign in before saving symptom entries.'
  //   isAuthPanelOpen.value = true
  //   return
  // }

  if (!validateEntryDateTimeStep()) {
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

    // TEMP: local testing fallback while auth is disabled
    if (!user.value) {
      const now = new Date().toISOString()
      const localEntry = {
        id: crypto.randomUUID(),
        condition_key: conditionKey(entryTitle.value),
        condition_label: entryTitle.value,
        source: 'veteran',
        entry_status: 'complete',
        severity: severityValue.value,
        occurred_at: occurredAt,
        summary: entryForm.value.what_happened || entryForm.value.condition_name || entryTitle.value,
        impact: entryForm.value.daily_impact || null,
        details,
        created_at: now,
        updated_at: now
      }
      const entries = [localEntry, ...readLocalEntries()]
      writeLocalEntries(entries)
      savedEntries.value = entries
      hasActiveDraft.value = false
      closeEntryPanel(true)
      return
    }

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
  // if (!user.value) {
  //   entriesError.value = 'Please sign in before deleting symptom entries.'
  //   isAuthPanelOpen.value = true
  //   return
  // }

  entriesError.value = ''

  try {
    // TEMP: local testing fallback while auth is disabled
    if (!user.value) {
      const entries = readLocalEntries().filter((entry) => entry.id !== id)
      writeLocalEntries(entries)
      savedEntries.value = entries
      return
    }

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

function handleProfileClick() {
  // if (user.value) {
  //   router.push('/profile')
  //   return
  // }
  //
  // toggleAuthPanel()

  router.push('/profile') // TEMP: allow profile without auth for testing
}

async function handleAuthSubmit() {
  isAuthSubmitting.value = true
  authMessage.value = ''

  try {
    if (authMode.value === 'login') {
      await signIn(authEmail.value, authPassword.value)
    } else {
      if (authPassword.value !== authConfirmPassword.value) {
        authMessage.value = 'Passwords do not match.'
        return
      }

      const data = await signUp(authEmail.value, authPassword.value, authName.value)

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
  isAuthSubmitting.value = true
  authMessage.value = ''

  try {
    await signOut()
    isAuthPanelOpen.value = false
    hasActiveDraft.value = false
    closeEntryPanel(true)
  } catch {
    // useSupabaseAuth exposes the message in authError.
  } finally {
    isAuthSubmitting.value = false
  }
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

function changeEntryCondition(condition: { title: string, category: string, description: string, image: string }) {
  if (condition.title === entryTitle.value) {
    isConditionPickerOpen.value = false
    return
  }

  selectedSearchCondition.value = condition

  if (entryForm.value.condition_name) {
    delete entryForm.value.condition_name
  }

  customConditionInput.value = ''
  entryStep.value = 0
  isConditionPickerOpen.value = false
}

function applyCustomEntryCondition() {
  const customName = customConditionInput.value.trim()
  if (!customName) {
    return
  }

  if (customName === entryTitle.value && !selectedSearchCondition.value) {
    isConditionPickerOpen.value = false
    return
  }

  selectedSearchCondition.value = null
  entryForm.value.condition_name = customName
  entryStep.value = 0
  isConditionPickerOpen.value = false
}

function toggleConditionPicker() {
  isConditionPickerOpen.value = !isConditionPickerOpen.value

  if (isConditionPickerOpen.value) {
    customConditionInput.value = selectedSearchCondition.value
      ? ''
      : (entryForm.value.condition_name?.trim() || '')
    return
  }

  customConditionInput.value = ''
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

function expandHistorySheet() {
  if (!historyExpanded.value) {
    historyExpanded.value = true
  }
}

function collapseHistorySheet() {
  if (!historyExpanded.value) {
    return
  }

  historyExpanded.value = false
  historyScrollEl.value?.scrollTo({ top: 0 })
}

function handleConditionScroll() {
  if (historyExpanded.value) {
    collapseHistorySheet()
  }
}

function handleConditionWheel() {
  if (historyExpanded.value) {
    collapseHistorySheet()
  }
}

let conditionTouchStartY = 0

function handleConditionTouchStart(event: TouchEvent) {
  conditionTouchStartY = event.touches[0]?.clientY ?? 0
}

function handleConditionTouchMove(event: TouchEvent) {
  if (!historyExpanded.value) {
    return
  }

  const currentY = event.touches[0]?.clientY ?? 0
  const deltaY = Math.abs(conditionTouchStartY - currentY)

  if (deltaY > 8) {
    collapseHistorySheet()
  }
}

function toggleHistoryExpanded() {
  if (historyExpanded.value) {
    collapseHistorySheet()
    return
  }

  expandHistorySheet()
}

function handleHistoryScroll(event: Event) {
  const target = event.target as HTMLElement

  if (!historyExpanded.value && target.scrollTop > 2) {
    expandHistorySheet()
  }
}

function handleHistoryWheel(event: WheelEvent) {
  if (!historyExpanded.value && event.deltaY > 0) {
    expandHistorySheet()
    return
  }

  if (historyExpanded.value && event.deltaY < 0 && (historyScrollEl.value?.scrollTop ?? 0) <= 0) {
    collapseHistorySheet()
  }
}

let historyTouchStartY = 0

function handleHistoryTouchStart(event: TouchEvent) {
  historyTouchStartY = event.touches[0]?.clientY ?? 0
}

function handleHistoryTouchMove(event: TouchEvent) {
  const currentY = event.touches[0]?.clientY ?? 0
  const deltaY = historyTouchStartY - currentY

  if (!historyExpanded.value && deltaY > 10) {
    expandHistorySheet()
    return
  }

  if (historyExpanded.value && deltaY < -28 && (historyScrollEl.value?.scrollTop ?? 0) <= 0) {
    collapseHistorySheet()
  }
}

function openEntryPanel() {
  // if (!user.value) {
  //   isAuthPanelOpen.value = true
  //   return
  // }

  historyExpanded.value = false
  transitionDirection.value = 'expand'
  entryStep.value = 0
  resetEntryForm()
  hasActiveDraft.value = true
  isConditionPickerOpen.value = false
  customConditionInput.value = ''
  isEntryOpen.value = true
}

function closeEntryPanel(clearDraft = false) {
  if (isEntryOpen.value) {
    transitionDirection.value = 'collapse'
  }

  if (clearDraft) {
    hasActiveDraft.value = false
  }

  isConditionPickerOpen.value = false
  customConditionInput.value = ''
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
  if (currentStepHasDateTimeField() && !validateEntryDateTimeStep()) {
    return
  }

  if (isLastEntryStep.value) {
    saveEntry()
    return
  }

  showNextEntryStep()
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
