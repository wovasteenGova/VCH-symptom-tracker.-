<template>
  <main
    class="app-shell relative overflow-hidden bg-slate-50 text-slate-950 transition-colors dark:bg-slate-950 dark:text-white"
    :class="{ 'app-shell-embed': isEmbeddedPreview }"
  >
    <section class="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden pt-4 pb-0 sm:max-w-lg">
      <header class="flex shrink-0 flex-col gap-4 px-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 items-center gap-2.5">
            <div class="size-10 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200 dark:ring-slate-700">
              <img
                :src="reportBranding.logoPath"
                alt="Veterans Central Hub"
                class="size-10 object-cover object-center"
              >
            </div>
            <span class="text-base font-bold tracking-[0.12em] text-slate-950 dark:text-white">VCH</span>
          </div>

          <div v-if="isEntryOpen" class="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="handleCancelEntry"
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

          <div v-else class="ml-auto flex shrink-0 items-center gap-2">
            <UColorModeSwitch
              size="md"
              color="primary"
              class="header-color-toggle"
            />

            <div v-if="user" class="relative">
              <button
                type="button"
                class="relative z-[60] grid size-10 place-items-center rounded-full shadow-sm ring-1 transition"
                :class="isSubmissionDropdownOpen
                  ? 'bg-sky-500 text-white ring-sky-400 dark:bg-sky-500 dark:text-white dark:ring-sky-400'
                  : 'bg-white text-slate-950 ring-slate-200 hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800'"
                :aria-expanded="isSubmissionDropdownOpen"
                aria-label="Open submissions and drafts"
                @click="toggleSubmissionDropdown"
              >
                <UIcon name="i-lucide-inbox" class="size-5" />
                <span
                  v-if="hasEntryDraft"
                  class="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[0.62rem] font-black leading-5 text-white ring-2 ring-slate-50 dark:ring-slate-950"
                >
                  !!
                </span>
                <span
                  v-else-if="unreadSubmissionCount"
                  class="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-sky-500 px-1.5 text-[0.65rem] font-bold leading-5 text-white ring-2 ring-slate-50 dark:ring-slate-950"
                >
                  {{ unreadSubmissionCount }}
                </span>
              </button>

              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="-translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-1 opacity-0"
              >
                <div
                  v-if="isSubmissionDropdownOpen"
                  class="fixed inset-0 z-40"
                  @click="closeSubmissionDropdown"
                />
              </Transition>

              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="-translate-y-1 opacity-0"
                enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-1 opacity-0"
              >
                <div
                  v-if="isSubmissionDropdownOpen"
                  class="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/15 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40"
                >
                  <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-inbox" class="size-4 text-sky-500" />
                      <p class="text-[0.875rem] font-bold text-slate-950 dark:text-white">Submissions</p>
                    </div>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      All observations submitted to your tracker.
                    </p>
                  </div>

                  <div class="max-h-80 overflow-y-auto no-scrollbar p-2">
                    <button
                      v-if="hasEntryDraft"
                      type="button"
                      class="relative mb-2 flex w-full items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-left transition hover:bg-red-100/80 dark:border-red-900/50 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                      @click="resumeEntryDraft"
                    >
                      <span class="relative mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-white text-red-600 ring-1 ring-red-200 dark:bg-slate-900 dark:text-red-300 dark:ring-red-900/60">
                        <UIcon name="i-lucide-files" class="size-4" />
                        <span class="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-red-500 px-0.5 text-[0.58rem] font-black leading-4 text-white ring-2 ring-red-50 dark:ring-red-950">
                          !!
                        </span>
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block text-[0.875rem] font-bold text-slate-950 dark:text-white">Draft</span>
                        <span class="mt-1 block truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {{ entryDraftPreview?.title || 'Symptom log' }}
                        </span>
                        <span class="mt-1 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-red-600 dark:text-red-300">
                          Saved {{ entryDraftPreview?.timeLabel || 'recently' }}
                        </span>
                      </span>
                    </button>

                    <div
                      v-if="!submissionNotifications.length && !hasEntryDraft"
                      class="px-2 py-6 text-center text-[0.875rem] text-slate-500 dark:text-slate-400"
                    >
                      No submissions yet.
                    </div>

                    <button
                      v-for="submission in submissionNotifications"
                      :key="submission.id"
                      type="button"
                      class="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      @click="focusSubmission(submission.id)"
                    >
                      <span
                        class="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full"
                        :class="highlightedSubmissionId === submission.id
                          ? 'bg-sky-400/15 text-sky-600 ring-1 ring-sky-300 dark:bg-sky-500/20 dark:text-sky-300 dark:ring-sky-500/50'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'"
                      >
                        <UIcon name="i-lucide-message-square-text" class="size-4" />
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="block truncate text-[0.875rem] font-bold text-slate-950 dark:text-white">{{ submission.title }}</span>
                        <span class="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">{{ submission.summary }}</span>
                        <span class="mt-1 block text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                          {{ submission.source }} · {{ submission.condition }} · {{ submission.timeLabel }}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <button
              type="button"
              class="grid size-10 place-items-center rounded-full bg-white text-slate-950 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800"
              :aria-label="user ? 'Open account' : 'Sign in'"
              @click="handleProfileClick"
            >
              <UIcon :name="user ? 'i-lucide-user-check' : 'i-lucide-user-round'" class="size-5" />
            </button>
          </div>
        </div>

        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{{ homeGreetingLine }}</p>
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
          class="fixed inset-0 z-50 overflow-y-auto overscroll-y-contain bg-slate-200/70 backdrop-blur-sm dark:bg-slate-950/70"
          @click.self="isAuthPanelOpen = false"
        >
          <div
            class="flex min-h-[100dvh] items-end justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:items-start sm:py-16"
          >
            <section
              class="w-full max-w-md max-h-[min(92dvh,calc(100dvh-2rem))] overflow-y-auto overscroll-y-contain rounded-4xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/40 sm:max-h-none sm:overflow-visible"
              @click.stop
            >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                  {{ user ? 'Account' : authMode === 'login' ? 'Welcome back' : 'Create account' }}
                </p>
                <h2 class="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                  {{ user ? user.email : authMode === 'login' ? 'Sign in to save entries' : 'Sign up to back up your logs' }}
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

            <div v-if="user" class="mt-4 space-y-3">
              <button
                v-if="isEmbeddedPreview"
                type="button"
                class="flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                @click="openEmbedProfile(); isAuthPanelOpen = false"
              >
                Account settings
              </button>
              <NuxtLink
                v-else
                to="/profile"
                class="flex w-full items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                @click="isAuthPanelOpen = false"
              >
                Account settings
              </NuxtLink>
              <button
                type="button"
                class="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950"
                :disabled="isAuthSubmitting"
                @click="handleSignOut"
              >
                {{ isAuthSubmitting ? 'Signing out...' : 'Sign out' }}
              </button>
              <p v-if="authError" class="text-center text-sm font-medium text-red-600 dark:text-red-300">{{ authError }}</p>
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
              <PasswordInput
                v-model="authConfirmPassword"
                autocomplete="new-password"
                placeholder="Re-enter password"
                required
              />
            </label>

            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Password</span>
              <PasswordInput
                v-model="authPassword"
                :autocomplete="authMode === 'signup' ? 'new-password' : 'current-password'"
                placeholder="At least 6 characters"
                required
              />
            </label>

            <button
              type="submit"
              class="w-full rounded-2xl bg-slate-950 px-4 py-4 text-base font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
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
              v-if="needsEmailConfirmation"
              type="button"
              class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300"
              :disabled="isAuthSubmitting || !authEmail"
              @click="handleResendConfirmation"
            >
              Resend confirmation email
            </button>

            <button
              type="button"
              class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300"
              @click="authMode = authMode === 'login' ? 'signup' : 'login'"
            >
              {{ authMode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in' }}
            </button>

            <p v-if="authMessage" class="text-center text-sm font-medium text-slate-600 dark:text-slate-300">{{ authMessage }}</p>
            <p v-if="authError" class="text-center text-sm font-medium text-red-600 dark:text-red-300">{{ authError }}</p>
            </form>
          </section>
          </div>
        </div>
      </Transition>

      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          enter-from-class="translate-y-6 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-350 ease-[cubic-bezier(0.55,0,1,0.45)]"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-4 opacity-0"
        >
          <section
            v-if="isEntryOpen"
            key="entry-workspace"
            class="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden"
          >
        <div class="flex min-h-0 flex-1 flex-col overflow-hidden px-5">
            <div
              class="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <div class="mb-6 shrink-0 flex items-center gap-4">
                  <img
                    :src="activeEntryImage"
                    :alt="entryTitle"
                    class="size-16 shrink-0 rounded-2xl object-cover"
                  >

                  <div class="min-w-0 flex-1">
                    <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      {{ isEditingEntry ? 'Edit Entry' : 'New Entry' }}
                    </p>
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
                      {{ hasCustomConditionSearch
                        ? (filteredPickerConditionResults.length ? 'Matching conditions' : 'No matches')
                        : 'Or pick from the list' }}
                    </p>
                  </div>

                  <div class="no-scrollbar max-h-52 space-y-0.5 overflow-y-auto p-2">
                    <div
                      v-if="showCustomConditionEmptyState"
                      class="rounded-xl px-3 py-4 text-center"
                    >
                      <p class="text-sm font-bold text-slate-950 dark:text-white">
                        No results
                      </p>
                      <p class="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Tap <span class="font-bold text-slate-950 dark:text-white">Use</span> to add
                        <span class="font-semibold text-slate-700 dark:text-slate-200">"{{ debouncedCustomConditionPreview.trim() }}"</span>
                        as a custom condition.
                      </p>
                    </div>

                    <button
                      v-for="result in filteredPickerConditionResults"
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
                      @click="handleEntryNextStep"
                    >
                      <UIcon name="i-lucide-chevron-right" class="size-5" />
                    </button>
                  </div>

                  <div
                    class="flex min-h-0 flex-1 flex-col overflow-hidden"
                    @touchstart.passive="handleEntrySwipeStart"
                    @touchend="handleEntrySwipeEnd"
                  >
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
                        ref="entryStepScrollEl"
                        :key="entryStep"
                        class="flex min-h-0 flex-1 flex-col"
                        :class="currentStepHasSliderField() && currentEntryStepFields.length === 1
                          ? 'justify-center px-1 py-4'
                          : currentStepIsEpisodeDetailStep()
                            ? 'mt-8 justify-start space-y-12 overflow-y-auto no-scrollbar pt-2'
                            : 'mt-6 justify-start space-y-6 overflow-y-auto no-scrollbar'"
                        :style="entryStepScrollStyle"
                        @focusin="handleEntryFieldFocus"
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
                          <p
                            v-if="field.helper"
                            class="-mt-2 mb-4 text-xs leading-5 text-slate-500 dark:text-slate-400"
                          >
                            {{ field.helper }}
                          </p>

                          <div
                            v-if="field.type === 'slider'"
                            data-step-swipe-block
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

                            <TimeOfDayPicker
                              :hour="entryTimeHour"
                              :minute="entryTimeMinute"
                              :period="entryTimePeriod"
                              class="mt-6 pb-6"
                              @update:hour="entryTimeHour = $event"
                              @update:minute="entryTimeMinute = $event"
                              @update:period="entryTimePeriod = $event"
                              @change="onEntryTimePartsChange"
                            />
                          </div>
                        </div>
                        <div
                          v-else-if="isEpisodeDurationField(field) || isEpisodeFollowUpField(field) || getEntryFieldPresets(field.label).length"
                          class="space-y-5"
                        >
                          <div class="flex flex-wrap gap-2.5">
                            <button
                              v-for="preset in getEntryFieldPresets(field.label)"
                              :key="preset.label"
                              type="button"
                              class="rounded-full px-3 py-1.5 text-xs font-bold transition"
                              :class="(isMultiSelectPresetField(field.label)
                                ? entryPresetIsSelected(entryForm[fieldKey(field.label)], preset.value)
                                : entryForm[fieldKey(field.label)] === preset.value)
                                ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'"
                              @click="applyEntryFieldPreset(field.label, preset.value)"
                            >
                              {{ preset.label }}
                            </button>
                          </div>
                          <Transition name="crisis-line">
                            <p
                              v-if="field.label === 'Daily impact' && activeEntryIsMentalHealth"
                              key="entry-crisis-line"
                              class="text-xs leading-5 text-slate-500 dark:text-slate-400"
                            >
                              {{ VA_CRISIS_LINE_SHORT }}
                            </p>
                          </Transition>
                          <textarea
                            v-if="field.type === 'textarea'"
                            v-model="entryForm[fieldKey(field.label)]"
                            :placeholder="field.placeholder"
                            rows="4"
                            class="w-full resize-none border-0 border-b border-slate-300/80 bg-transparent px-0 py-4 text-base font-medium leading-7 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:text-white dark:focus:border-slate-400"
                          />
                          <input
                            v-else
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
                          v-else-if="field.type !== 'slider' && field.type !== 'datetime' && !isEpisodeDurationField(field) && !isEpisodeFollowUpField(field) && !getEntryFieldPresets(field.label).length"
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

              <div
                class="mt-auto shrink-0"
                :style="{ minHeight: isEntryKeyboardOpen ? '0px' : `${entryActionBarHeight}px` }"
              >
              <StickyActionBar
                class="-mx-5 rounded-none border-x-0 dark:border-slate-800"
                :keyboard-offset="entryKeyboardInset"
              >
                <button
                  v-if="isEditingEntry && user && !isEntryKeyboardOpen"
                  type="button"
                  class="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  @click="openShareLinkForEntry(editingEntryId!)"
                >
                  <UIcon name="i-lucide-link" class="size-4" />
                  Create private link for this entry
                </button>

                <button
                  type="button"
                  class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                  :disabled="isSavingEntry"
                  @click="handleEntryPrimaryAction"
                >
                  {{ isSavingEntry ? 'Saving...' : isLastEntryStep ? (isEditingEntry ? 'Save changes' : 'Finish') : 'Continue' }}
                  <UIcon :name="isLastEntryStep ? 'i-lucide-check' : 'i-lucide-arrow-right'" class="size-5" />
                </button>
                <p v-if="entryError" class="mt-3 text-center text-sm font-medium text-red-300">
                  {{ entryError }}
                </p>
              </StickyActionBar>
              </div>
            </div>
        </div>
      </section>

          <div
            v-else
            key="home-workspace"
            class="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-hidden"
          >
        <div
          class="flex min-h-0 flex-col px-4 transition-[flex] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          :class="carouselWorkspaceClass"
          @wheel.passive="handleConditionWheel"
          @touchstart.passive="handleConditionTouchStart"
          @touchmove.passive="handleConditionTouchMove"
        >
          <div class="relative flex min-h-0 flex-1 flex-col">
            <div
              class="relative min-h-0 w-full flex-1 overflow-hidden rounded-[1.75rem]"
              @touchstart.passive="handleConditionSwipeStart"
              @touchend="handleConditionSwipeEnd"
            >
              <ConditionBrowser
                v-if="showConditionBrowser"
                class="absolute inset-0 z-20 bg-slate-50 dark:bg-slate-950"
                :mode="needsOnboarding ? 'onboarding' : 'manage'"
                :conditions="conditionPickerOptions"
                :selected-keys="draftSelectedKeys"
                :locked-keys="[]"
                :show-pro-limit="false"
                :saving="isSavingTrackedConditions"
                :error="trackedConditionsError"
                @toggle="toggleDraftCondition"
                @confirm="confirmConditionOnboarding"
                @done="finishConditionBrowser"
              />

              <template v-else-if="homeConditions.length">
                <Transition
                  :enter-active-class="slideEnterActiveClass"
                  :enter-from-class="slideEnterFromClass"
                  enter-to-class="translate-y-0 opacity-100"
                  :leave-active-class="slideLeaveActiveClass"
                  leave-from-class="translate-y-0 opacity-100"
                  :leave-to-class="slideLeaveToClass"
                >
                  <div
                    :key="isHomeOverviewSlide ? 'home-overview' : activeCondition.key"
                    class="absolute inset-0"
                  >
                    <div
                      v-if="isHomeOverviewSlide"
                      class="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 dark:bg-slate-950"
                    >
                      <div class="shrink-0 px-4 pt-2 pb-5">
                        <div class="flex items-center justify-between gap-2">
                          <h2 class="text-lg font-bold text-slate-950 dark:text-white">
                            Your conditions
                          </h2>
                          <div class="flex shrink-0 items-center gap-2">
                            <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                              {{ trackedConditionCount }} picked
                            </span>
                            <button
                              type="button"
                              class="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                              @click.stop="openConditionBrowser"
                            >
                              All conditions
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
                        <div
                          data-home-conditions-scroll
                          class="no-scrollbar min-h-0 flex-1 overflow-y-auto px-2 pt-4"
                          @scroll="handleConditionScroll"
                        >
                          <div class="space-y-1">
                            <button
                              v-for="condition in homeConditions"
                              :key="condition.key"
                              type="button"
                              class="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition hover:bg-slate-100 active:scale-[0.995] dark:hover:bg-slate-800/80"
                              @click="logHomeCondition(condition)"
                            >
                              <img
                                :src="condition.image"
                                :alt="condition.title"
                                class="size-16 shrink-0 rounded-2xl object-cover"
                              >

                              <span class="min-w-0 flex-1">
                                <span class="block text-lg font-bold leading-snug text-slate-950 dark:text-white">
                                  {{ condition.title }}
                                </span>
                                <span class="mt-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                                  {{ condition.category }}
                                </span>
                              </span>

                              <UIcon
                                v-if="isConditionLogLocked(condition.key)"
                                name="i-lucide-lock"
                                class="size-5 shrink-0 text-amber-600 dark:text-amber-300"
                                aria-hidden="true"
                              />
                              <UIcon
                                v-else
                                name="i-lucide-chevron-right"
                                class="size-5 shrink-0 text-slate-400 dark:text-slate-500"
                                aria-hidden="true"
                              />
                            </button>
                          </div>

                          <!-- Overview only: dots → tip → crisis stay in scroll under conditions. DO NOT move to footer. -->
                          <div class="mt-8 px-2 pb-1">
                            <div class="flex justify-center gap-2">
                              <button
                                v-for="slideIndex in homeCarouselSlideCount"
                                :key="`overview-dot-${slideIndex - 1}`"
                                type="button"
                                class="h-2 rounded-full transition-all"
                                :class="[
                                  slideIndex - 1 === activeIndex ? 'w-7 bg-slate-950 dark:bg-white' : 'w-2 bg-slate-300 dark:bg-slate-600'
                                ]"
                                :aria-label="slideIndex === 1 ? 'Show your conditions overview' : `Show ${homeConditions[slideIndex - 2]?.title}`"
                                @click="showSlide(slideIndex - 1)"
                              />
                            </div>

                            <div v-if="homeVisitTip" class="mt-6">
                              <Transition name="home-tip" mode="out-in">
                                <HomeVisitTipCard
                                  :key="`${homeVisitTip.title}-${homeVisitTip.text}`"
                                  :tip="homeVisitTip"
                                  @show-all="isHomeTipsOverlayOpen = true"
                                />
                              </Transition>
                            </div>

                            <p class="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                              {{ VA_CRISIS_LINE_SHORT }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <template v-else>
                      <div
                        class="absolute inset-0"
                        :class="isConditionSlideEntryEnabled ? 'cursor-pointer' : 'pointer-events-none'"
                        :role="isConditionSlideEntryEnabled ? 'button' : undefined"
                        :tabindex="isConditionSlideEntryEnabled ? 0 : -1"
                        :aria-label="`Log ${activeCondition.title} entry`"
                        @click="startEntryFromCurrentSlide"
                        @keydown.enter.prevent="startEntryFromCurrentSlide"
                        @keydown.space.prevent="startEntryFromCurrentSlide"
                      >
                        <img
                          :src="activeCondition.image"
                          :alt="activeCondition.title"
                          class="h-full w-full object-cover"
                        >

                        <div class="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/70 via-black/20 to-transparent p-5 pb-10">
                          <h2 class="text-2xl font-bold text-white">{{ activeCondition.title }}</h2>
                        </div>
                      </div>
                    </template>
                  </div>
                </Transition>
              </template>
            </div>

            <div
              v-if="homeConditions.length && !showConditionBrowser"
              class="shrink-0 pt-3"
            >
              <!-- Condition slides only: dots → tip → crisis below the image. Overview chrome stays in scroll above. -->
              <template v-if="!isHomeOverviewSlide">
                <div class="flex justify-center gap-2">
                  <button
                    v-for="slideIndex in homeCarouselSlideCount"
                    :key="slideIndex - 1"
                    type="button"
                    class="h-2 rounded-full transition-all"
                    :class="[
                      slideIndex - 1 === activeIndex ? 'w-7 bg-slate-950 dark:bg-white' : 'w-2 bg-slate-300 dark:bg-slate-600'
                    ]"
                    :aria-label="slideIndex === 1 ? 'Show your conditions overview' : `Show ${homeConditions[slideIndex - 2]?.title}`"
                    @click="showSlide(slideIndex - 1)"
                  />
                </div>

                <div v-if="homeVisitTip" class="mt-6">
                  <Transition name="home-tip" mode="out-in">
                    <HomeVisitTipCard
                      :key="`${homeVisitTip.title}-${homeVisitTip.text}`"
                      :tip="homeVisitTip"
                      @show-all="isHomeTipsOverlayOpen = true"
                    />
                  </Transition>
                </div>

                <p class="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {{ VA_CRISIS_LINE_SHORT }}
                </p>
              </template>

              <div
                v-if="isDesktopLayout && !historyExpanded"
                class="flex items-center justify-center gap-4"
                :class="isHomeOverviewSlide ? '' : 'mt-4'"
              >
                <button
                  type="button"
                  class="grid size-11 place-items-center rounded-full bg-white text-slate-950 shadow-lg ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800"
                  aria-label="Previous slide"
                  @click="showPreviousCondition"
                >
                  <UIcon name="i-lucide-chevron-left" class="size-5" />
                </button>

                <button
                  v-if="isHomeOverviewSlide"
                  type="button"
                  class="grid size-[4.5rem] place-items-center rounded-full bg-white text-slate-950 shadow-xl ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
                  aria-label="Browse all conditions"
                  @click="openConditionBrowser"
                >
                  <UIcon name="i-lucide-plus" class="size-9" />
                </button>
                <button
                  v-else
                  type="button"
                  class="grid size-[4.5rem] place-items-center rounded-full bg-white text-slate-950 shadow-xl ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
                  :class="historyExpanded ? 'scale-90' : 'scale-100'"
                  :aria-label="`Add ${activeCondition.title} entry`"
                  @click="startEntryFromCurrentSlide"
                >
                  <UIcon name="i-lucide-plus" class="size-9" />
                </button>

                <button
                  type="button"
                  class="grid size-11 place-items-center rounded-full bg-white text-slate-950 shadow-lg ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-white dark:ring-slate-800 dark:hover:bg-slate-800"
                  aria-label="Next slide"
                  @click="showNextCondition"
                >
                  <UIcon name="i-lucide-chevron-right" class="size-5" />
                </button>
              </div>

              <div v-else-if="!isHomeOverviewSlide" class="mt-4 flex w-full justify-center">
                <button
                  type="button"
                  class="flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-base font-bold text-white shadow-xl transition active:scale-[0.98] dark:bg-white dark:text-slate-950"
                  :aria-label="`Log ${activeCondition.title} entry`"
                  @click="startEntryFromCurrentSlide"
                >
                  <UIcon name="i-lucide-plus" class="size-5" />
                  Log {{ activeCondition.title }}
                </button>
              </div>

            </div>
          </div>
        </div>

        <section
          class="flex min-h-0 flex-col overflow-hidden rounded-t-[1.75rem] border-t border-slate-200/80 bg-white transition-[flex,height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:border-slate-800 dark:bg-slate-900"
          :class="historyPanelClass"
          @pointerdown="handleHistoryPointerDown"
          @pointermove="handleHistoryPointerMove"
          @pointerup="handleHistoryPointerUp"
          @pointercancel="handleHistoryPointerCancel"
        >
          <div class="flex w-full shrink-0 cursor-grab flex-col items-center py-3 active:cursor-grabbing">
            <span class="h-1.5 w-14 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>

          <div class="shrink-0 px-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <h2 class="text-2xl font-bold text-slate-950 dark:text-white">History</h2>
              </div>
              <div class="relative flex shrink-0 items-center gap-2">
                <MonthlyBackupReminderTip
                  :open="isMonthlyBackupReminderVisible"
                  @dismiss="dismissMonthlyBackupReminder"
                />
                <span
                  v-if="user && !entitlementsLoaded"
                  class="relative inline-flex shrink-0 items-center rounded-full bg-slate-200 px-3 py-1.5 ring-1 ring-slate-300/60 dark:bg-slate-800 dark:ring-slate-600/70"
                  aria-hidden="true"
                >
                  <span class="inline-block h-3 w-10 animate-pulse rounded-full bg-slate-400/70 dark:bg-slate-600/80" />
                </span>
                <span
                  v-else-if="user"
                  class="relative inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] ring-1"
                  :class="isPro
                    ? 'bg-amber-400/15 text-amber-700 ring-amber-400/40 dark:bg-amber-500/20 dark:text-amber-100 dark:ring-amber-400/80'
                    : 'bg-sky-100 text-sky-700 ring-sky-300/60 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-600/70'"
                >
                  <UIcon
                    :name="isPro ? 'i-lucide-crown' : 'i-lucide-sparkles'"
                    class="size-3.5"
                    :class="isPro ? 'text-amber-600 dark:text-amber-300' : 'text-sky-600 dark:text-sky-300'"
                  />
                  {{ isPro ? 'Pro' : 'Free' }}
                  <span
                    class="absolute -right-0.5 -top-0.5 grid size-[0.825rem] place-items-center rounded-full bg-slate-950 ring-[1.5px] ring-white dark:bg-black dark:ring-slate-900"
                    aria-hidden="true"
                  >
                    <UIcon name="i-lucide-check" class="size-[0.55rem] text-emerald-400" />
                  </span>
                </span>
                <button
                  v-else
                  type="button"
                  data-history-interactive
                  class="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-slate-700 ring-1 ring-slate-300/60 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600/70 dark:hover:bg-slate-700"
                  @click="isAuthPanelOpen = true"
                >
                  <UIcon name="i-lucide-log-in" class="size-3.5" />
                  Not logged in
                </button>
              </div>
            </div>
            <p v-if="exportError" class="mt-2 text-sm font-medium text-red-600 dark:text-red-300">
              {{ exportError }}
            </p>
            <p v-if="exportNotice" class="mt-2 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
              <UIcon name="i-lucide-crown" class="mt-0.5 size-3.5 shrink-0 text-amber-600 dark:text-amber-300" />
              <span>
                {{ exportNotice }}
                <NuxtLink to="/upgrade" data-history-interactive class="font-bold underline decoration-amber-600/60 underline-offset-2 hover:text-amber-800 dark:decoration-amber-300/60 dark:hover:text-amber-50">
                  Get Pro now
                </NuxtLink>
              </span>
            </p>

            <div
              v-if="highlightedSubmissionNotice && highlightedSubmissionNotice.source === 'Family'"
              class="mt-3 flex items-start gap-2.5 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2.5 dark:border-sky-700/60 dark:bg-sky-950/40"
            >
              <span class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-sky-400/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-300">
                <UIcon name="i-lucide-message-square-text" class="size-3.5" />
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[0.875rem] font-bold text-slate-950 dark:text-white">
                  New family observation
                </p>
                <p class="mt-0.5 truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {{ highlightedSubmissionNotice.title }}
                </p>
                <p class="mt-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-sky-600 dark:text-sky-400">
                  {{ highlightedSubmissionNotice.condition }} · {{ highlightedSubmissionNotice.timeLabel }}
                </p>
              </div>
            </div>

            <div
              class="mt-4 rounded-full bg-slate-100 p-1 dark:bg-slate-800/80"
              @touchstart.passive="handleHistoryTabSwipeStart"
              @touchend="handleHistoryTabSwipeEnd"
            >
              <div class="grid grid-cols-3 gap-1">
                <button
                  v-for="tab in historyTabs"
                  :key="tab"
                  type="button"
                  data-history-interactive
                  class="relative rounded-full px-4 py-3 text-sm font-semibold transition"
                  :class="activeHistoryTab === tab ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'"
                  @click.stop="selectHistoryTab(tab)"
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
          >
            <div v-if="activeHistoryTab === 'Entries'" class="divide-y divide-slate-200 dark:divide-slate-800">
              <div v-if="!user && !isAuthLoading" class="py-8 text-center">
                <p class="font-bold text-slate-950 dark:text-white">Sign in to save entries</p>
                <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  Your symptom logs sync to your account once you sign in.
                </p>
                <button
                  type="button"
                  data-history-interactive
                  class="mt-4 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
                  @click="toggleAuthPanel"
                >
                  Sign in
                </button>
              </div>
              <div v-else-if="isLoadingEntries" class="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
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
                :data-entry-id="entry.id"
                data-history-interactive
                class="rounded-2xl px-2 py-3 transition duration-500 hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-900/70 dark:active:bg-slate-900"
                :class="highlightedSubmissionId === entry.id
                  ? 'submission-flash bg-sky-50 ring-2 ring-sky-300 shadow-lg shadow-sky-950/10 dark:bg-sky-950/30 dark:ring-sky-500/70 dark:shadow-black/20'
                  : ''"
              >
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-100 text-center transition dark:bg-slate-800"
                    :class="entry.statusColor"
                    :aria-label="`Edit ${entry.title}`"
                    @click="openEntryForEdit(entry.id)"
                  >
                    <div>
                      <p class="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{{ entry.month }}</p>
                      <p class="text-lg font-bold leading-none text-slate-950 dark:text-white">{{ entry.day }}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    class="min-w-0 flex-1 text-left"
                    :aria-label="`View and edit ${entry.title}`"
                    @click="openEntryForEdit(entry.id)"
                  >
                    <div class="flex flex-wrap items-center gap-2">
                      <UBadge color="neutral" variant="soft" size="sm">{{ entry.condition }}</UBadge>
                      <UBadge :color="entry.source === 'Family' ? 'info' : 'primary'" variant="soft" size="sm">
                        {{ entry.source }}
                      </UBadge>
                      <UBadge v-if="entry.wasEdited" color="warning" variant="soft" size="sm">
                        Edited
                      </UBadge>
                    </div>

                    <h3 class="mt-2 truncate font-bold text-slate-950 dark:text-white">{{ entry.title }}</h3>
                    <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span class="inline-flex items-center gap-1">
                        <UIcon name="i-lucide-clock-3" class="size-3.5" />
                        {{ entry.time }}
                      </span>
                      <span class="text-slate-300 dark:text-slate-700">•</span>
                      <span>Severity {{ entry.severity }}/10</span>
                      <span class="text-slate-300 dark:text-slate-700">•</span>
                      <span>{{ entry.summary }}</span>
                    </div>
                    <p v-if="entry.editedLabel" class="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {{ entry.editedLabel }}
                    </p>
                  </button>

                  <button
                    v-if="entry.source === 'Veteran'"
                    type="button"
                    data-history-interactive
                    class="grid size-10 shrink-0 place-items-center rounded-full transition"
                    :class="canUseFamilyReporting
                      ? 'text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/40 dark:hover:text-sky-300'
                      : 'text-amber-500/80 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/30 dark:hover:text-amber-300'"
                    :aria-label="canUseFamilyReporting ? `Create private link for ${entry.title}` : 'Family reporting requires Pro'"
                    @click.stop="openShareLinkForEntry(entry.id)"
                  >
                    <UIcon :name="canUseFamilyReporting ? 'i-lucide-link' : 'i-lucide-lock'" class="size-4" />
                  </button>

                  <button
                    type="button"
                    data-history-interactive
                    class="grid size-10 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                    :aria-label="`Delete ${entry.title}`"
                    @click.stop="requestDeleteEntry(entry.id)"
                  >
                    <UIcon name="i-lucide-trash-2" class="size-4" />
                  </button>
                </div>
              </article>
            </div>

            <div
              v-else-if="activeHistoryTab === 'Calendar'"
              class="py-1"
              @touchstart.passive="handleCalendarSwipeStart"
              @touchend="handleCalendarSwipeEnd"
            >
              <div class="flex items-center justify-between">
                <button
                  v-if="isDesktopLayout"
                  type="button"
                  data-history-interactive
                  class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Previous month"
                  @click="showPreviousHistoryMonth"
                >
                  <UIcon name="i-lucide-chevron-left" class="size-4" />
                </button>
                <div v-else class="size-8" />

                <p class="font-bold text-slate-950 dark:text-white">{{ historyMonthLabel }}</p>

                <button
                  v-if="isDesktopLayout"
                  type="button"
                  data-history-interactive
                  class="grid size-8 place-items-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                  aria-label="Next month"
                  :disabled="!canShowNextHistoryMonth"
                  @click="showNextHistoryMonth"
                >
                  <UIcon name="i-lucide-chevron-right" class="size-4" />
                </button>
                <div v-else class="size-8" />
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

              <LoggingActivityReport :metrics="loggingActivityMetrics" />
            </div>

            <div v-else-if="activeHistoryTab === 'Export'" class="pb-4">
              <div
                class="rounded-full bg-slate-100 p-1 dark:bg-slate-800/80"
              >
                <div class="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    data-history-interactive
                    class="rounded-full px-3 py-2.5 text-xs font-semibold transition"
                    :class="pdfExportType === 'full'
                      ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'"
                    @click="pdfExportType = 'full'"
                  >
                    Full report
                  </button>
                  <button
                    type="button"
                    data-history-interactive
                    class="rounded-full px-3 py-2.5 text-xs font-semibold transition"
                    :class="pdfExportType === 'cp-exam'
                      ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 dark:text-slate-400'"
                    @click="pdfExportType = 'cp-exam'"
                  >
                    Personal review
                  </button>
                </div>
              </div>

              <p class="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {{ pdfExportDescription }}
              </p>

              <div v-if="!user && !isAuthLoading" class="py-8 text-center">
                <p class="font-bold text-slate-950 dark:text-white">Sign in to export</p>
                <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Your symptom logs need to be saved to your account before you can download a PDF.
                </p>
                <button
                  type="button"
                  data-history-interactive
                  class="mt-4 rounded-full bg-slate-950 px-5 py-3 text-xs font-bold text-white dark:bg-white dark:text-slate-950"
                  @click="toggleAuthPanel"
                >
                  Sign in
                </button>
              </div>

              <div v-else-if="!exportableConditions.length" class="py-8 text-center">
                <p class="font-bold text-slate-950 dark:text-white">Nothing to export yet</p>
                <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Log at least one symptom entry, then come back here to build your PDF.
                </p>
              </div>

              <template v-else>
                <div class="mt-4 flex items-center justify-between gap-3">
                  <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    Conditions
                  </p>
                  <button
                    type="button"
                    data-history-interactive
                    class="text-xs font-semibold text-sky-600 transition hover:text-sky-700 dark:text-sky-300 dark:hover:text-sky-200"
                    @click="toggleAllExportConditions"
                  >
                    {{ allExportConditionsSelected ? 'Clear all' : 'Select all' }}
                  </button>
                </div>

                <div class="mt-2 space-y-2">
                  <label
                    v-for="condition in exportableConditions"
                    :key="condition.key"
                    data-history-interactive
                    class="flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition"
                    :class="isExportConditionSelected(condition.key)
                      ? 'bg-slate-100 dark:bg-slate-800/80'
                      : 'bg-transparent'"
                  >
                    <input
                      type="checkbox"
                      class="size-4 shrink-0 rounded border-slate-300 text-slate-950 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-900"
                      :checked="isExportConditionSelected(condition.key)"
                      @change="toggleExportCondition(condition.key)"
                    >
                    <span class="min-w-0 flex-1">
                      <span class="block truncate font-semibold text-slate-950 dark:text-white">{{ condition.label }}</span>
                      <span class="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                        {{ condition.entryCount }} {{ condition.entryCount === 1 ? 'entry' : 'entries' }}
                      </span>
                    </span>
                  </label>
                </div>

                <p
                  v-if="!selectedExportConditionKeys.length"
                  class="mt-3 text-xs font-medium text-amber-700 dark:text-amber-200"
                >
                  Select at least one condition to include in the PDF.
                </p>

                <label
                  v-if="pdfExportType === 'full'"
                  class="mt-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900/60 dark:bg-amber-950/30"
                >
                  <input
                    v-model="pdfExportAcknowledged"
                    type="checkbox"
                    data-history-interactive
                    class="mt-0.5 size-4 rounded border-slate-300 text-slate-950 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-900"
                  >
                  <span class="text-xs leading-5 text-amber-950 dark:text-amber-100">
                    {{ PDF_EXPORT_ACKNOWLEDGMENT_LABEL }}
                  </span>
                </label>

                <button
                  type="button"
                  data-history-interactive
                  class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-xs font-bold text-white transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                  :disabled="!canConfirmPdfExport"
                  @click="runPdfExport"
                >
                  <UIcon name="i-lucide-download" class="size-4" />
                  {{ exportButtonLabel }}
                </button>
              </template>
            </div>

            <div v-if="activeHistoryTab !== 'Export'" class="mt-2 flex items-center justify-center gap-3 pb-1 text-xs font-semibold text-slate-500">
              <NuxtLink to="/install" data-history-interactive class="hover:text-slate-700 dark:hover:text-slate-300">Install</NuxtLink>
              <NuxtLink to="/privacy" data-history-interactive class="hover:text-slate-700 dark:hover:text-slate-300">Privacy</NuxtLink>
              <NuxtLink to="/disclaimer" data-history-interactive class="hover:text-slate-700 dark:hover:text-slate-300">Disclaimer</NuxtLink>
            </div>
          </div>
        </section>
      </div>
        </Transition>
      </div>
    </section>

    <Transition
      enter-active-class="transition duration-250 ease-out"
      enter-from-class="translate-x-full opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-full opacity-0"
    >
      <div
        v-if="isEmbeddedPreview && isEmbedProfileOpen"
        class="absolute inset-0 z-[100] flex min-h-0 flex-col overflow-hidden bg-slate-950"
      >
        <ProfilePage />
      </div>
    </Transition>
  </main>

  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="pendingDelete"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 sm:items-center"
      @click.self="cancelDeleteEntry"
    >
      <div class="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl dark:bg-slate-900">
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Move to deleted
        </p>
        <h3 class="mt-2 text-xl font-bold text-slate-950 dark:text-white">
          Delete this entry?
        </h3>
        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <span class="font-semibold text-slate-950 dark:text-white">{{ pendingDelete.title }}</span>
          will move to Deleted in your account settings. You can restore it later from there.
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            @click="cancelDeleteEntry"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            @click="confirmDeleteEntry"
          >
            Move to Deleted
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isShareLinkOpen && shareLinkEntry"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-4 sm:items-center"
      @click.self="closeShareLinkModal"
    >
      <div class="w-full max-w-md rounded-[1.75rem] bg-white p-5 shadow-2xl dark:bg-slate-900">
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          Private supporter link
        </p>
        <h3 class="mt-2 text-xl font-bold text-slate-950 dark:text-white">
          Share this entry
        </h3>
        <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Create a one-time private URL for someone you trust to report what they observed about
          <span class="font-semibold text-slate-950 dark:text-white">{{ shareLinkEntry.summary || shareLinkEntry.condition_label }}</span>.
        </p>

        <div v-if="!shareLinkCreatedUrl" class="mt-5 space-y-4">
          <label class="block">
            <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Link label (optional)</span>
            <input
              v-model="shareLinkLabel"
              type="text"
              class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              placeholder="Example: Spouse, caregiver"
            >
          </label>

          <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Visible condition</p>
            <p class="mt-1 font-semibold text-slate-950 dark:text-white">{{ shareLinkEntry.condition_label }}</p>
          </div>

          <button
            type="button"
            class="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950"
            :disabled="isCreatingShareLink"
            @click="createShareLinkForEntry"
          >
            {{ isCreatingShareLink ? 'Creating...' : 'Create private link' }}
          </button>
        </div>

        <div v-else class="mt-5 space-y-4">
          <p class="break-all rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            {{ shareLinkCreatedUrl }}
          </p>
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white"
            @click="copyShareLink"
          >
            <UIcon :name="shareLinkCopied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-4" />
            {{ shareLinkCopied ? 'Copied to clipboard' : 'Copy link' }}
          </button>
        </div>

        <p v-if="shareLinkError" class="mt-4 text-center text-sm font-medium text-red-600 dark:text-red-300">{{ shareLinkError }}</p>

        <button
          type="button"
          class="mt-4 w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400"
          @click="closeShareLinkModal"
        >
          Close
        </button>
      </div>
    </div>
  </Transition>

  <AppWelcomeCarousel
    v-if="needsAppWelcome && !isEntryOpen"
    :install-platform="installPlatform"
    :install-instruction-text="installInstructionText"
    :install-guide-video-url="installGuideVideoUrl"
    :can-prompt-install="canPromptInstall"
    @complete="handleWelcomeComplete"
    @prompt-install="promptInstall"
  />

  <LoggingCadencePrompt
    :open="isLoggingCadencePromptOpen"
    :caution="weeklyLogCaution"
    @close="closeLoggingCadencePrompt"
    @continue="confirmLoggingCadencePrompt"
  />

  <UpgradePromptModal
    :open="isUpgradePromptOpen"
    :title="upgradePromptTitle"
    :description="upgradePromptDescription"
    :is-checkout-loading="isUpgradeCheckoutLoading"
    @close="closeUpgradePrompt"
    @upgrade="handleUpgradeCheckout"
  />

  <HomeTipsOverlay
    :open="isHomeTipsOverlayOpen"
    :tips="homeVisitTips"
    @close="isHomeTipsOverlayOpen = false"
  />

  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isConditionSlotOpen"
      class="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
      @click.self="closeConditionSlotModal"
    >
      <div class="w-full max-w-md rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-sky-300">Free plan</p>
        <h3 class="mt-2 text-xl font-bold text-white">
          {{ pendingConditionSlotMode === 'replace' ? 'Switch to' : 'Use' }} {{ pendingConditionSlotLabel }}?
        </h3>
        <p class="mt-3 text-sm leading-6 text-slate-300">
          <template v-if="pendingConditionSlotMode === 'replace'">
            You have not logged anything yet, so you can change your free condition to this one.
          </template>
          <template v-else>
            Free includes {{ FREE_CONDITION_LIMIT }} conditions with unlimited entries in each.
            <span v-if="freeConditionSlotsRemaining === FREE_CONDITION_LIMIT">Pick one condition to start.</span>
            <span v-else-if="freeConditionSlotsRemaining === 1">This will use your free condition slot.</span>
            <span v-else>Your free condition slot is already used.</span>
          </template>
        </p>
        <p v-if="freeConditionKeys.length" class="mt-3 text-xs leading-5 text-slate-400">
          Current: {{ freeConditionLabels.join(', ') || 'None yet' }}
        </p>
        <p v-if="conditionSlotError" class="mt-3 text-sm font-medium text-red-300">{{ conditionSlotError }}</p>
        <div class="mt-5 grid gap-3">
          <button
            type="button"
            class="w-full rounded-2xl bg-white px-4 py-4 text-base font-bold text-slate-950"
            :disabled="isConfirmingConditionSlot"
            @click="confirmConditionSlot"
          >
            {{ isConfirmingConditionSlot ? 'Saving...' : pendingConditionSlotMode === 'replace' ? `Switch to ${pendingConditionSlotLabel}` : `Use ${pendingConditionSlotLabel}` }}
          </button>
          <button
            type="button"
            class="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700"
            @click="closeConditionSlotModal"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '../../composables/useSupabaseAuth'
import { useSymptomEntries } from '../../composables/useSymptomEntries'
import { useSymptomPdfExport } from '../../composables/useSymptomPdfExport'
import { useDeletedEntryArchive } from '../../composables/useDeletedEntryArchive'
import { useUserProfiles } from '../../composables/useUserProfiles'
import { useEntitlements } from '../../composables/useEntitlements'
import { useAppWelcome } from '../../composables/useAppWelcome'
import { useTrackedConditions } from '../../composables/useTrackedConditions'
import { FREE_CONDITION_LIMIT, PRO_ANNUAL_PRICE_LABEL, formatConditionKeyLabel, conditionKeyFromLabel } from '../../utils/subscription'
import { mapEntryHistoryItem } from '../../utils/entryDisplay'
import { copyToClipboard } from '../../utils/copyToClipboard'
import { PDF_EXPORT_ACKNOWLEDGMENT_LABEL } from '../../utils/pdfExportCertification'
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
  splitEntryDateTimeLocal,
  toLocalDateTimeInputValue
} from '../../utils/symptomDateTime'
import {
  entryPresetIsSelected,
  getEntryFieldPresets,
  isMultiSelectPresetField,
  toggleEntryFieldPresetValue
} from '../../utils/entryFieldPresets'
import {
  defaultEntryFields,
  entryFieldsByCondition,
  getEntryFieldsForSearchCondition,
  isEpisodeDurationField,
  isEpisodeFollowUpField
} from '../../utils/vaConditionFields'
import { reportBranding } from '../../utils/reportBranding'
import { androidAddToHomeScreenVideoUrl, iosAddToHomeScreenVideoUrl } from '../../utils/installGuide'
import { filterAndRankConditions } from '../../utils/conditionSearch'
import { getWeeklyLogCaution, type WeeklyLogCaution } from '../../utils/loggingCadence'
import { buildLoggingActivityMetrics } from '../../utils/loggingActivityReport'
import { conditionCatalog, buildHomeVisitTips, normalizeConditionLabel, pickRandomHomeVisitTip, resolveCatalogConditionByStoredKey, VA_CRISIS_LINE_SHORT } from '../../utils/conditionCatalog'
import { conditionImageAssets } from '../../utils/conditionImages'
import { getSeverityGuidance, severityQuickPresets } from '../../utils/severityGuidance'
import { CalendarDate } from '@internationalized/date'
import { computed, nextTick, onBeforeMount, onBeforeUnmount, onMounted, provide, ref, shallowRef, watch } from 'vue'
import { useKeyboardAwareScroll } from '../../composables/useKeyboardAwareScroll'
import {
  buildEntryDraftSnapshot,
  clearEntryDraft,
  formatEntryDraftTimeLabel,
  isMeaningfulEntryDraft,
  readEntryDraft,
  writeEntryDraft,
  type EntryDraftSnapshot
} from '../../composables/useEntryDraft'
import { useTrackerLayout, TRACKER_CLOSE_EMBED_PROFILE_KEY } from '../../composables/useTrackerLayout'
import ProfilePage from '../profile.vue'

const {
  user,
  isAuthLoading,
  authError,
  signIn,
  signUp,
  resendConfirmationEmail,
  signInWithGoogle,
  sendPasswordReset,
  signOut
} = useSupabaseAuth()
const router = useRouter()
const { getProfile } = useUserProfiles()
const {
  isPro,
  freeConditionKeys,
  freeConditionSlotsRemaining,
  canUseFamilyReporting,
  canTrackCondition,
  canAddFreeCondition,
  addFreeCondition,
  canReplaceFreeCondition,
  replaceFreeCondition,
  syncFreeConditionKey,
  entitlementsLoaded,
  loadEntitlements
} = useEntitlements()
const {
  needsAppWelcome,
  loggingCadence,
  weeklyLogDay,
  loadAppWelcomeState,
  completeAppWelcome
} = useAppWelcome()
const {
  trackedConditionKeys,
  needsOnboarding,
  trackedConditionCount,
  hasLoadedTrackedConditions,
  loadTrackedConditions,
  completeOnboarding,
  updateTrackedConditions
} = useTrackedConditions()
const { showSubmissionToast } = useSubmissionToast()

const profileDisplayName = ref('')
const homeGreetingWord = ref<'Hello' | 'Hey'>('Hello')

const activeIndex = ref(0)
const activeHistoryTab = ref('Entries')
const isEntryOpen = ref(false)
const isConditionPickerOpen = ref(false)
const customConditionInput = ref('')
const debouncedCustomConditionPreview = ref('')
const isAuthPanelOpen = ref(false)
const authMode = ref<'login' | 'signup'>('login')
const authName = ref('')
const authEmail = ref('')
const authPassword = ref('')
const authConfirmPassword = ref('')
const authMessage = ref('')
const needsEmailConfirmation = ref(false)
const isAuthSubmitting = ref(false)
const hasActiveDraft = ref(false)
const entryDraftPreview = ref<{ title: string, timeLabel: string } | null>(null)
const isRestoringEntryDraft = ref(false)
const entryStep = ref(0)
const editingEntryId = ref<string | null>(null)
const editingEntryConditionLabel = ref<string | null>(null)
const severityValue = ref(5)
const isEditingEntry = computed(() => Boolean(editingEntryId.value))

const severityGuidance = computed(() => getSeverityGuidance(severityValue.value))
const entryForm = ref<Record<string, string>>({})
const isSavingEntry = ref(false)
const entryError = ref('')
const isLoadingEntries = ref(false)
const entriesError = ref('')
const savedEntries = ref<any[]>([])
const isExportingPdf = ref(false)
const exportError = ref('')
const exportNotice = ref('')
const pdfExportType = ref<'full' | 'cp-exam'>('full')
const selectedExportConditionKeys = ref<string[]>([])
const pdfExportAcknowledged = ref(false)
const transitionDirection = ref('next')
const installPlatform = ref<'ios' | 'android' | 'desktop'>('desktop')
const deferredInstallPrompt = ref<any>(null)
const historyExpanded = ref(false)
const historyScrollEl = ref<HTMLElement | null>(null)
const conditionSlideEntryBlocked = ref(false)
let conditionSlideEntryBlockedTimer: ReturnType<typeof setTimeout> | undefined
const homeVisitTip = ref<{ title: string, text: string } | null>(null)
const isHomeTipsOverlayOpen = ref(false)
const homeVisitTips = computed(() => buildHomeVisitTips(homeConditions.value))
const {
  runLogReminderCheck,
  hydrateReminderSettings,
  persistReminderSettings,
  enableRemindersWithPermission
} = useLogReminders()
const homeSortUsesEntryDates = ref(false)
const { isDesktopLayout, isMobileLayout, isEmbeddedPreview } = useTrackerLayout()
const isEmbedProfileOpen = ref(false)

function closeEmbedProfile() {
  isEmbedProfileOpen.value = false
  isConditionBrowserOpen.value = false
  activeIndex.value = 0
}

function openEmbedProfile() {
  isEmbedProfileOpen.value = true
}

provide(TRACKER_CLOSE_EMBED_PROFILE_KEY, closeEmbedProfile)
const isConditionScrolling = ref(false)
const isSubmissionDropdownOpen = ref(false)
const lastSeenSubmissionAt = ref('')
const highlightedSubmissionId = ref<string | null>(null)
const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedSearchCondition = ref<null | {
  title: string
  category: string
  description: string
  image: string
}>(null)

const { downloadEntriesPdf, downloadCpExamPdf } = useSymptomPdfExport()
const { archiveDeletedEntry } = useDeletedEntryArchive()
const {
  isMonthlyBackupReminderVisible,
  dismissMonthlyBackupReminder,
  refreshMonthlyBackupReminder
} = useMonthlyBackupReminder(
  () => user.value?.id,
  () => savedEntries.value.length > 0
)

const initialEntryDateTime = splitEntryDateTimeLocal(getMaxEntryDateTimeLocal())
const initialEntryTimeParts = parseTime24ToParts(initialEntryDateTime.time)
const entryCalendarDate = shallowRef<CalendarDate | undefined>(
  import.meta.client ? dateStringToCalendarDate(initialEntryDateTime.date) : undefined
)
const entryTimeInput = ref(initialEntryDateTime.time)
const entryTimeHour = ref(initialEntryTimeParts.hour12)
const entryTimeMinute = ref(initialEntryTimeParts.minute)
const entryTimePeriod = ref<'AM' | 'PM'>(initialEntryTimeParts.period)

const entryStepScrollEl = ref<HTMLElement | null>(null)
const entryActionBarHeight = computed(() => (
  isEditingEntry.value && user.value ? 176 : 112
))
const {
  scrollStyle: entryStepScrollStyle,
  handleFieldFocus: handleEntryFieldFocus,
  keyboardInset: entryKeyboardInset,
  isKeyboardOpen: isEntryKeyboardOpen
} = useKeyboardAwareScroll(entryStepScrollEl, {
  footerHeight: entryActionBarHeight
})
const entryPickerViewMonth = ref({
  year: new Date().getFullYear(),
  month: new Date().getMonth()
})

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

const historyTabs = ['Entries', 'Calendar', 'Export']
const installDismissedKey = 'symptom-tracker-install-dismissed'

function readInstallPlatform(): 'ios' | 'android' | 'desktop' {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIos = /iphone|ipad|ipod/.test(userAgent)
  const isAndroid = /android/.test(userAgent)

  return isIos ? 'ios' : isAndroid ? 'android' : 'desktop'
}

const submissionHighlightDurationMs = 5_000

const pendingDelete = ref<null | {
  id: string
  mode: 'archive'
  title: string
}>(null)
const isShareLinkOpen = ref(false)
const shareLinkEntry = ref<any | null>(null)
const shareLinkLabel = ref('')
const shareLinkCreatedUrl = ref('')
const shareLinkCopied = ref(false)
const shareLinkError = ref('')
const isCreatingShareLink = ref(false)
const isUpgradePromptOpen = ref(false)
const upgradePromptTitle = ref('Upgrade to Pro')
const upgradePromptDescription = ref('')
const isUpgradeCheckoutLoading = ref(false)
const isConditionSlotOpen = ref(false)
const pendingConditionSlotKey = ref('')
const pendingConditionSlotLabel = ref('')
const pendingConditionSlotMode = ref<'add' | 'replace'>('add')
const pendingEntryPanelOptions = ref<{
  prefillCustomCondition?: string
  condition?: {
    title: string
    category: string
    description: string
    image: string
  }
} | null>(null)
const isConfirmingConditionSlot = ref(false)
const isLoggingCadencePromptOpen = ref(false)
const weeklyLogCaution = ref<WeeklyLogCaution | null>(null)
const pendingCadenceEntryOptions = ref<{
  prefillCustomCondition?: string
  condition?: {
    title: string
    category: string
    description: string
    image: string
  }
} | null>(null)
const conditionSlotError = ref('')
const isConditionBrowserOpen = ref(false)
const draftSelectedKeys = ref<string[]>([])
const isSavingTrackedConditions = ref(false)
const trackedConditionsError = ref('')

const conditionResults = conditionCatalog

type HomeCondition = typeof conditionCatalog[number]

const conditionPickerOptions = computed(() => conditionCatalog)

const homeConditions = computed(() => {
  const lastRecordedAt = new Map<string, number>()
  const trackedOrder = new Map<string, number>()

  trackedConditionKeys.value.forEach((storedKey, index) => {
    const resolvedKey = resolveCatalogConditionByStoredKey(storedKey)?.key ?? storedKey
    if (!trackedOrder.has(resolvedKey)) {
      trackedOrder.set(resolvedKey, index)
    }
  })

  for (const entry of savedEntries.value) {
    if (!entry.condition_key) {
      continue
    }

    const resolvedKey = resolveCatalogConditionByStoredKey(entry.condition_key)?.key ?? entry.condition_key
    const timestamp = new Date(entry.occurred_at || entry.created_at).getTime()
    const previous = lastRecordedAt.get(resolvedKey) ?? 0

    if (timestamp > previous) {
      lastRecordedAt.set(resolvedKey, timestamp)
    }
  }

  const conditions = trackedConditionKeys.value
    .map((storedKey) => resolveCatalogConditionByStoredKey(storedKey))
    .filter((condition): condition is HomeCondition => Boolean(condition))

  return conditions.sort((a, b) => {
    if (homeSortUsesEntryDates.value) {
      const lastRecordedDiff = (lastRecordedAt.get(b.key) ?? 0) - (lastRecordedAt.get(a.key) ?? 0)
      if (lastRecordedDiff !== 0) {
        return lastRecordedDiff
      }
    }

    return (trackedOrder.get(a.key) ?? 0) - (trackedOrder.get(b.key) ?? 0)
  })
})

const showConditionBrowser = computed(() => {
  if (!hasLoadedTrackedConditions.value && !trackedConditionKeys.value.length) {
    return false
  }

  return needsOnboarding.value || isConditionBrowserOpen.value
})

function trackedConditionKeysSignature(keys: string[]) {
  return [...keys].sort().join('|')
}

function refreshHomeVisitTip() {
  if (showConditionBrowser.value || !homeConditions.value.length) {
    if (!homeConditions.value.length) {
      homeVisitTip.value = null
    }
    return
  }

  homeVisitTip.value = pickRandomHomeVisitTip(homeConditions.value)
}

function scheduleLogReminderCheck() {
  if (!user.value) {
    return
  }

  runLogReminderCheck({
    cadence: loggingCadence.value,
    weeklyLogDay: weeklyLogDay.value,
    entries: savedEntries.value,
    isAuthenticated: true
  })
}

let logReminderIntervalId: ReturnType<typeof setInterval> | undefined

function handleLogReminderVisibilityChange() {
  if (document.visibilityState === 'visible') {
    scheduleLogReminderCheck()
  }
}

const historyEntries = computed(() => {
  return [...savedEntries.value]
    .sort((a, b) => {
      const bTime = new Date(b.created_at || b.occurred_at).getTime()
      const aTime = new Date(a.created_at || a.occurred_at).getTime()
      return bTime - aTime
    })
    .map((entry) => mapEntryHistoryItem(entry))
})

const submissionNotifications = computed(() => {
  return savedEntries.value
    .map((entry) => {
      const entryDate = entry.occurred_at ? new Date(entry.occurred_at) : new Date(entry.created_at)
      const conditionLabel = normalizeConditionLabel(entry.condition_label)

      return {
        id: entry.id,
        condition: conditionLabel,
        source: entry.source === 'family' ? 'Family' : 'Veteran',
        title: entry.summary || conditionLabel,
        summary: entry.impact || 'No impact note added',
        createdAt: entry.created_at || entry.occurred_at || '',
        timeLabel: entryDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        })
      }
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const unreadSubmissionCount = computed(() => {
  if (!lastSeenSubmissionAt.value) {
    return submissionNotifications.value.length
  }

  const lastSeenTime = new Date(lastSeenSubmissionAt.value).getTime()
  return submissionNotifications.value.filter((submission) => {
    return new Date(submission.createdAt).getTime() > lastSeenTime
  }).length
})

const highlightedSubmissionNotice = computed(() => {
  if (!highlightedSubmissionId.value) {
    return null
  }

  return submissionNotifications.value.find((submission) => {
    return submission.id === highlightedSubmissionId.value
  }) ?? null
})

const hasEntryDraft = computed(() => {
  if (entryDraftPreview.value) {
    return true
  }

  if (!hasActiveDraft.value || isEntryOpen.value || editingEntryId.value) {
    return false
  }

  return isMeaningfulEntryDraft({
    entryStep: entryStep.value,
    entryForm: entryForm.value,
    selectedSearchCondition: selectedSearchCondition.value,
    customConditionInput: customConditionInput.value
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

const loggingActivityMetrics = computed(() => {
  const view = historyViewMonth.value
  return buildLoggingActivityMetrics(savedEntries.value, view.year, view.month)
})

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

const isHomeOverviewSlide = computed(() => activeIndex.value === 0)

const carouselWorkspaceClass = computed(() => {
  if (!historyExpanded.value) {
    return 'flex-1 pb-3'
  }

  return isDesktopLayout.value ? 'flex-[7] pb-1' : 'flex-[1] pb-1'
})

const historyPanelClass = computed(() => {
  if (!historyExpanded.value) {
    return 'h-[5rem] shrink-0'
  }

  if (isDesktopLayout.value) {
    return 'relative z-30 flex-[13]'
  }

  return 'relative z-30 flex-[4]'
})

const isConditionSlideEntryEnabled = computed(() => {
  return !historyExpanded.value && !conditionSlideEntryBlocked.value
})

const homeCarouselSlideCount = computed(() => homeConditions.value.length + 1)

function isConditionLogLocked(key: string) {
  if (isPro.value || !user.value) {
    return false
  }

  if (savedEntries.value.length === 0) {
    return false
  }

  return !canTrackCondition(key)
}

const activeCondition = computed(() => {
  if (isHomeOverviewSlide.value) {
    return homeConditions.value[0] || conditionCatalog[0]
  }

  return homeConditions.value[activeIndex.value - 1] || homeConditions.value[0] || conditionCatalog[0]
})
const entryTitle = computed(() => {
  if (isConditionPickerOpen.value) {
    const previewName = debouncedCustomConditionPreview.value.trim()
    if (previewName) {
      return previewName
    }
  }

  if (selectedSearchCondition.value) {
    return selectedSearchCondition.value.title
  }

  const customName = entryForm.value.condition_name?.trim()
  if (customName) {
    return customName
  }

  if (editingEntryConditionLabel.value) {
    return editingEntryConditionLabel.value
  }

  return activeCondition.value?.title || 'Custom condition'
})
const homeGreetingLine = computed(() => {
  if (!user.value) {
    return 'Today'
  }

  const firstName = profileDisplayName.value.trim().split(/\s+/)[0]
    || user.value.email?.split('@')[0]
    || 'there'

  return `${homeGreetingWord.value}, ${firstName}`
})
const freeConditionLabels = computed(() => {
  return freeConditionKeys.value.map((key) => {
    const matchedEntry = savedEntries.value.find((entry) => entry.condition_key === key)
    return normalizeConditionLabel(matchedEntry?.condition_label || formatConditionKeyLabel(key))
  })
})

type ExportableCondition = {
  key: string
  label: string
  entryCount: number
}

const exportableConditions = computed((): ExportableCondition[] => {
  const groups = new Map<string, { label: string, count: number }>()

  for (const entry of savedEntries.value) {
    const resolvedCondition = resolveCatalogConditionByStoredKey(entry.condition_key || entry.condition_label)
    const key = resolvedCondition?.key || entry.condition_key || conditionKey(entry.condition_label)
    const label = resolvedCondition?.title || normalizeConditionLabel(entry.condition_label || formatConditionKeyLabel(key))
    const existing = groups.get(key)

    if (existing) {
      existing.count += 1
    } else {
      groups.set(key, { label, count: 1 })
    }
  }

  return [...groups.entries()]
    .map(([key, data]) => ({
      key,
      label: data.label,
      entryCount: data.count
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})


const allExportConditionsSelected = computed(() => {
  if (!exportableConditions.value.length) {
    return false
  }

  return exportableConditions.value.every((condition) => (
    selectedExportConditionKeys.value.includes(condition.key)
  ))
})

const pdfExportDescription = computed(() => {
  if (pdfExportType.value === 'cp-exam') {
    return 'Personal review summary from your logs — frequency, severity, functional impact, and topics you reported most often. Not for VA upload.'
  }

  return 'Signed Veteran Symptom History Report with summary stats, logging consistency charts, and your full entry log.'
})

const canConfirmPdfExport = computed(() => {
  if (isExportingPdf.value || !selectedExportConditionKeys.value.length) {
    return false
  }

  if (pdfExportType.value === 'full') {
    return pdfExportAcknowledged.value
  }

  return true
})

const exportButtonLabel = computed(() => {
  if (isExportingPdf.value) {
    return 'Preparing...'
  }

  const count = selectedExportConditionKeys.value.length

  if (pdfExportType.value === 'cp-exam') {
    return count === 1 ? 'Download personal review' : `Download personal review (${count} conditions)`
  }

  return count === 1 ? 'Download signed PDF' : `Download signed PDF (${count} conditions)`
})

function isExportConditionSelected(conditionKey: string) {
  return selectedExportConditionKeys.value.includes(conditionKey)
}

function toggleExportCondition(conditionKey: string) {
  if (isExportConditionSelected(conditionKey)) {
    selectedExportConditionKeys.value = selectedExportConditionKeys.value.filter((key) => key !== conditionKey)
    return
  }

  selectedExportConditionKeys.value = [...selectedExportConditionKeys.value, conditionKey]
}

function toggleAllExportConditions() {
  if (allExportConditionsSelected.value) {
    selectedExportConditionKeys.value = []
    return
  }

  selectedExportConditionKeys.value = exportableConditions.value.map((condition) => condition.key)
}

function ensureExportConditionSelection() {
  if (!exportableConditions.value.length) {
    selectedExportConditionKeys.value = []
    return
  }

  const validKeys = new Set(exportableConditions.value.map((condition) => condition.key))
  const retained = selectedExportConditionKeys.value.filter((key) => validKeys.has(key))

  selectedExportConditionKeys.value = retained.length
    ? retained
    : exportableConditions.value.map((condition) => condition.key)
}

function resolveExportEntries(conditionKeys: string[]) {
  const keySet = new Set(conditionKeys)

  return savedEntries.value.filter((entry) => {
    const resolvedCondition = resolveCatalogConditionByStoredKey(entry.condition_key || entry.condition_label)
    const entryKey = resolvedCondition?.key || entry.condition_key || conditionKey(entry.condition_label)
    return keySet.has(entryKey)
  })
}

function buildExportConditionLabel(conditionKeys: string[]) {
  const selected = exportableConditions.value.filter((condition) => conditionKeys.includes(condition.key))

  if (selected.length === 1) {
    return selected[0].label
  }

  if (selected.length === exportableConditions.value.length) {
    return null
  }

  return `${selected.length} conditions`
}

watch(exportableConditions, () => {
  ensureExportConditionSelection()
})

const activeEntryImage = computed(() => {
  if (selectedSearchCondition.value?.image) {
    return selectedSearchCondition.value.image
  }

  return activeCondition.value?.image || conditionImageAssets.mentalHealth
})
const activeEntryFields = computed(() => {
  if (selectedSearchCondition.value) {
    return getEntryFieldsForSearchCondition(selectedSearchCondition.value)
  }

  const customName = entryForm.value.condition_name?.trim()
  if (customName) {
    return [
      {
        label: 'Condition name',
        type: 'text',
        placeholder: 'Example: tinnitus, sinusitis, skin flare-up...'
      },
      ...defaultEntryFields
    ]
  }

  if (editingEntryConditionLabel.value) {
    return entryFieldsByCondition[editingEntryConditionLabel.value as keyof typeof entryFieldsByCondition]
      || defaultEntryFields
  }

  const activeTitle = activeCondition.value?.title
  if (activeTitle) {
    return entryFieldsByCondition[activeTitle as keyof typeof entryFieldsByCondition] || defaultEntryFields
  }

  return defaultEntryFields
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

const activeEntryIsMentalHealth = computed(() => {
  const category = selectedSearchCondition.value?.category
    || activeCondition.value?.category
    || ''

  return category.toLowerCase().includes('mental')
})
const slideEnterActiveClass = computed(() => {
  if (transitionDirection.value === 'expand') {
    return 'transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
  }

  return 'transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]'
})
const slideLeaveActiveClass = computed(() => {
  if (transitionDirection.value === 'expand' || transitionDirection.value === 'collapse') {
    return 'transition duration-350 ease-[cubic-bezier(0.55,0,1,0.45)]'
  }

  return 'transition duration-300 ease-[cubic-bezier(0.55,0,1,0.45)]'
})
const slideEnterFromClass = computed(() => {
  if (transitionDirection.value === 'expand') {
    return 'translate-y-5 opacity-0'
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
    return 'translate-y-3 opacity-0'
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
  return filterAndRankConditions(conditionResults, query)
}

const filteredConditionResults = computed(() => filterConditionResults(debouncedSearchQuery.value))
const hasConditionSearch = computed(() => debouncedSearchQuery.value.trim().length > 0)
const showConditionSearchEmptyState = computed(() =>
  hasConditionSearch.value && filteredConditionResults.value.length === 0
)
const filteredPickerConditionResults = computed(() => filterConditionResults(debouncedCustomConditionPreview.value))
const hasCustomConditionSearch = computed(() => debouncedCustomConditionPreview.value.trim().length > 0)
const showCustomConditionEmptyState = computed(() =>
  hasCustomConditionSearch.value && filteredPickerConditionResults.value.length === 0
)
const canPromptInstall = computed(() => Boolean(deferredInstallPrompt.value))
const installGuideVideoUrl = computed(() => {
  if (installPlatform.value === 'ios') {
    return iosAddToHomeScreenVideoUrl
  }

  if (installPlatform.value === 'android') {
    return androidAddToHomeScreenVideoUrl
  }

  return null
})
const installInstructionText = computed(() => {
  if (installPlatform.value === 'ios') {
    return 'On iPhone: use Safari, tap Share, then Add to Home Screen.'
  }

  if (installPlatform.value === 'android') {
    return canPromptInstall.value
      ? 'On Android: tap Install app, or use Chrome menu > Add to Home screen.'
      : 'On Android: open Chrome menu, then tap Add to Home screen or Install app.'
  }

  return 'Open this link on your phone, then add it to your home screen for the app-like experience.'
})

let searchTimer: ReturnType<typeof setTimeout> | undefined
let customConditionTimer: ReturnType<typeof setTimeout> | undefined
let conditionScrollTimer: ReturnType<typeof setTimeout> | undefined
let submissionHighlightTimer: ReturnType<typeof setTimeout> | undefined
let entryDraftSaveTimer: ReturnType<typeof setTimeout> | undefined

function refreshEntryDraftPreview() {
  const snapshot = readEntryDraft(user.value?.id)

  if (snapshot && isMeaningfulEntryDraft(snapshot)) {
    entryDraftPreview.value = {
      title: snapshot.conditionTitle || 'Symptom log',
      timeLabel: formatEntryDraftTimeLabel(snapshot.savedAt)
    }
    return
  }

  if (
    hasActiveDraft.value
    && !isEntryOpen.value
    && !editingEntryId.value
    && isMeaningfulEntryDraft({
      entryStep: entryStep.value,
      entryForm: entryForm.value,
      selectedSearchCondition: selectedSearchCondition.value,
      customConditionInput: customConditionInput.value
    })
  ) {
    entryDraftPreview.value = {
      title: entryTitle.value,
      timeLabel: 'This session'
    }
    return
  }

  entryDraftPreview.value = null
}

function persistEntryDraftNow() {
  if (isRestoringEntryDraft.value || editingEntryId.value) {
    return
  }

  const snapshot = buildEntryDraftSnapshot({
    entryStep: entryStep.value,
    severityValue: severityValue.value,
    entryForm: entryForm.value,
    selectedSearchCondition: selectedSearchCondition.value,
    customConditionInput: customConditionInput.value,
    conditionTitle: entryTitle.value
  })

  if (!snapshot) {
    clearEntryDraft(user.value?.id)
    refreshEntryDraftPreview()
    return
  }

  writeEntryDraft(user.value?.id, snapshot)
  refreshEntryDraftPreview()
}

function scheduleEntryDraftSave() {
  if (isRestoringEntryDraft.value || editingEntryId.value) {
    return
  }

  if (entryDraftSaveTimer) {
    clearTimeout(entryDraftSaveTimer)
  }

  entryDraftSaveTimer = setTimeout(() => {
    persistEntryDraftNow()
  }, 800)
}

function clearPersistedEntryDraft() {
  clearEntryDraft(user.value?.id)
  refreshEntryDraftPreview()
}

function restoreEntryDraftSnapshot(snapshot: EntryDraftSnapshot) {
  isRestoringEntryDraft.value = true
  historyExpanded.value = false
  transitionDirection.value = 'expand'
  editingEntryId.value = null
  editingEntryConditionLabel.value = null
  entryError.value = ''
  entryStep.value = snapshot.entryStep
  severityValue.value = snapshot.severityValue
  entryForm.value = { ...snapshot.entryForm }
  selectedSearchCondition.value = snapshot.selectedSearchCondition
    ? { ...snapshot.selectedSearchCondition }
    : null
  customConditionInput.value = snapshot.customConditionInput
  debouncedCustomConditionPreview.value = snapshot.customConditionInput
  isConditionPickerOpen.value = false
  hasActiveDraft.value = true
  syncEntryInputsFromForm()
  isRestoringEntryDraft.value = false
}

function resumeEntryDraft() {
  closeSubmissionDropdown()

  if (
    hasActiveDraft.value
    && isMeaningfulEntryDraft({
      entryStep: entryStep.value,
      entryForm: entryForm.value,
      selectedSearchCondition: selectedSearchCondition.value,
      customConditionInput: customConditionInput.value
    })
  ) {
    historyExpanded.value = false
    transitionDirection.value = 'expand'
    isEntryOpen.value = true
    return
  }

  const snapshot = readEntryDraft(user.value?.id)

  if (!snapshot) {
    refreshEntryDraftPreview()
    return
  }

  restoreEntryDraftSnapshot(snapshot)
  isEntryOpen.value = true
}

watch(searchQuery, (value) => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(() => {
    debouncedSearchQuery.value = value
  }, 250)
})

watch(customConditionInput, (value) => {
  if (customConditionTimer) {
    clearTimeout(customConditionTimer)
  }

  customConditionTimer = setTimeout(() => {
    debouncedCustomConditionPreview.value = value
  }, 250)
})

watch(isConditionPickerOpen, (open) => {
  if (!open) {
    debouncedCustomConditionPreview.value = ''
    if (customConditionTimer) {
      clearTimeout(customConditionTimer)
    }
  }
})

onBeforeMount(() => {
  installPlatform.value = readInstallPlatform()
})

onMounted(async () => {
  homeGreetingWord.value = Math.random() < 0.5 ? 'Hello' : 'Hey'
  setupInstallCard()
  await loadAppWelcomeState()

  if (!entryCalendarDate.value) {
    syncEntryInputsFromForm()
  }

  await refreshTrackedConditions()

  if (user.value) {
    loadProfileDisplayName()
    loadEntitlements()
    loadEntries()
    refreshEntryDraftPreview()
  }

  document.addEventListener('visibilitychange', handleLogReminderVisibilityChange)
  logReminderIntervalId = window.setInterval(scheduleLogReminderCheck, 60 * 60 * 1000)
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', handleLogReminderVisibilityChange)

  if (logReminderIntervalId) {
    clearInterval(logReminderIntervalId)
  }
})

watch(user, async (currentUser) => {
  if (currentUser) {
    isAuthPanelOpen.value = false
    loadProfileDisplayName()
    loadEntitlements()
    await loadAppWelcomeState()
    await loadEntries()
    await refreshTrackedConditions()
    refreshEntryDraftPreview()
    return
  }

  profileDisplayName.value = ''
  savedEntries.value = []
  closeEntryPanel(true, true)
  refreshEntryDraftPreview()
  await refreshTrackedConditions()
})

watch(needsOnboarding, (needsOnboardingNow) => {
  if (needsOnboardingNow) {
    draftSelectedKeys.value = [...trackedConditionKeys.value]
    isConditionBrowserOpen.value = false
    return
  }

  if (!draftSelectedKeys.value.length && trackedConditionKeys.value.length) {
    draftSelectedKeys.value = [...trackedConditionKeys.value]
  }
}, { immediate: true })

watch(isHomeOverviewSlide, (isOverview) => {
  if (isOverview) {
    refreshHomeVisitTip()
  }
}, { immediate: true })

watch(isEntryOpen, (open) => {
  if (!open && isHomeOverviewSlide.value) {
    refreshHomeVisitTip()
  }

  if (!open || editingEntryId.value) {
    return
  }

  scheduleEntryDraftSave()
})

watch(historyExpanded, (expanded) => {
  if (expanded) {
    conditionSlideEntryBlocked.value = true
    return
  }

  blockConditionSlideEntry(HISTORY_TRANSITION_LOCK_MS)
})

watch(
  [entryForm, () => severityValue.value, entryStep, selectedSearchCondition, customConditionInput],
  () => {
    if (!isEntryOpen.value || editingEntryId.value || isRestoringEntryDraft.value) {
      return
    }

    hasActiveDraft.value = true
    scheduleEntryDraftSave()
  },
  { deep: true }
)

watch(trackedConditionKeys, () => {
  if (isHomeOverviewSlide.value) {
    refreshHomeVisitTip()
  }
}, { deep: true })

watch(showConditionBrowser, (isOpen) => {
  if (!isOpen && isHomeOverviewSlide.value) {
    refreshHomeVisitTip()
  }
})

watch(trackedConditionKeys, (keys) => {
  if (!keys.length) {
    activeIndex.value = 0
    return
  }

  if (activeIndex.value > keys.length) {
    activeIndex.value = keys.length
  }
})

async function loadProfileDisplayName() {
  if (!user.value) {
    profileDisplayName.value = ''
    return
  }

  try {
    const profile = await getProfile()
    profileDisplayName.value = profile?.full_name?.trim()
      || (typeof user.value.user_metadata?.full_name === 'string'
        ? user.value.user_metadata.full_name.trim()
        : '')
  } catch {
    profileDisplayName.value = typeof user.value.user_metadata?.full_name === 'string'
      ? user.value.user_metadata.full_name.trim()
      : ''
  }
}

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
  const key = fieldKey(label)

  if (isMultiSelectPresetField(label)) {
    entryForm.value[key] = toggleEntryFieldPresetValue(entryForm.value[key], value)
    return
  }

  entryForm.value[key] = value
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

async function exportCpExamPdf(conditionKeys: string[]) {
  isExportingPdf.value = true
  exportError.value = ''
  exportNotice.value = ''

  try {
    const entries = resolveExportEntries(conditionKeys)
    const conditionLabel = buildExportConditionLabel(conditionKeys)

    if (!entries.length) {
      exportError.value = 'No entries found for the selected conditions.'
      return
    }

    const profile = await getProfile()
    const veteranName = profile?.full_name?.trim()
      || (typeof user.value?.user_metadata?.full_name === 'string'
        ? user.value.user_metadata.full_name.trim()
        : '')

    await downloadCpExamPdf(entries, {
      veteranName: veteranName || null,
      conditionLabel
    })
  } catch (error) {
    exportError.value = getErrorMessage(error)
  } finally {
    isExportingPdf.value = false
  }
}

async function exportEntriesPdf(conditionKeys: string[]) {
  isExportingPdf.value = true
  exportError.value = ''
  exportNotice.value = ''

  try {
    const entries = resolveExportEntries(conditionKeys)
    const conditionLabel = buildExportConditionLabel(conditionKeys)

    if (!entries.length) {
      exportError.value = 'No entries found for the selected conditions.'
      return
    }

    const profile = await getProfile()
    const veteranName = profile?.full_name?.trim()
      || (typeof user.value?.user_metadata?.full_name === 'string'
        ? user.value.user_metadata.full_name.trim()
        : '')

    await downloadEntriesPdf(entries, {
      veteranName: veteranName || null,
      veteranEmail: user.value?.email || null,
      includeLoggingCharts: true,
      includeAdvancedCharts: isPro.value,
      conditionLabel,
      loggingCadence: loggingCadence.value,
      weeklyLogDay: weeklyLogDay.value
    })

    if (!isPro.value) {
      exportNotice.value = 'PDF downloaded with your entries and weekly symptom counts. Pro adds severity trends and advanced charts. '
    }
  } catch (error) {
    exportError.value = getErrorMessage(error)
  } finally {
    isExportingPdf.value = false
  }
}

async function runPdfExport() {
  if (!canConfirmPdfExport.value) {
    return
  }

  exportError.value = ''
  dismissMonthlyBackupReminder()

  if (pdfExportType.value === 'cp-exam') {
    await exportCpExamPdf(selectedExportConditionKeys.value)
  } else {
    await exportEntriesPdf(selectedExportConditionKeys.value)
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

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredInstallPrompt.value = event
    installPlatform.value = 'android'
  })

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt.value = null
    window.localStorage.setItem(installDismissedKey, 'true')
  })
}

async function promptInstall() {
  if (!deferredInstallPrompt.value) {
    return
  }

  deferredInstallPrompt.value.prompt()
  await deferredInstallPrompt.value.userChoice
  deferredInstallPrompt.value = null
}

async function refreshTrackedConditions() {
  const entryKeys = [...new Set(savedEntries.value.map((entry) => entry.condition_key).filter(Boolean))]
  await loadTrackedConditions(entryKeys)

  if (needsOnboarding.value) {
    draftSelectedKeys.value = [...trackedConditionKeys.value]
  }
}

function openConditionBrowser() {
  draftSelectedKeys.value = [...trackedConditionKeys.value]
  trackedConditionsError.value = ''
  isConditionBrowserOpen.value = true
  collapseHistorySheet()
}

function toggleDraftCondition(key: string) {
  trackedConditionsError.value = ''

  if (draftSelectedKeys.value.includes(key)) {
    if (!needsOnboarding.value && draftSelectedKeys.value.length === 1) {
      trackedConditionsError.value = 'Keep at least one condition on your home screen.'
      return
    }

    draftSelectedKeys.value = draftSelectedKeys.value.filter((existingKey) => existingKey !== key)
    return
  }

  draftSelectedKeys.value = [...draftSelectedKeys.value, key]
}

async function syncFreeConditionWithTrackedKeys(keys: string[]) {
  if (isPro.value || !keys.length || !user.value) {
    return
  }

  if (freeConditionKeys.value.length === 0 && savedEntries.value.length === 0) {
    return
  }

  const normalizedKeys = keys
    .map((key) => resolveCatalogConditionByStoredKey(key)?.key ?? key)
    .filter(Boolean)

  if (!normalizedKeys.length) {
    return
  }

  const activeFreeKey = freeConditionKeys.value[0]
  if (activeFreeKey && normalizedKeys.includes(activeFreeKey)) {
    return
  }

  const nextKey = normalizedKeys[0]
  if (!nextKey) {
    return
  }

  if (savedEntries.value.length === 0) {
    await replaceFreeCondition(nextKey, 0)
    return
  }

  if (canReplaceFreeCondition(nextKey, savedEntries.value.length)) {
    await replaceFreeCondition(nextKey, savedEntries.value.length)
  }
}

async function syncHomeConditionsAfterEntrySave(savedConditionKey: string) {
  const resolved = resolveCatalogConditionByStoredKey(savedConditionKey)
  if (!resolved) {
    return
  }

  const key = resolved.key

  if (isPro.value) {
    if (!trackedConditionKeys.value.includes(key)) {
      await updateTrackedConditions([...trackedConditionKeys.value, key])
    }
    return
  }

  const trackedAlreadyMatches = trackedConditionKeys.value.length === 1 && trackedConditionKeys.value[0] === key
  if (!trackedAlreadyMatches) {
    await updateTrackedConditions([key])
  }

  await syncFreeConditionKey(key)
}

async function confirmConditionOnboarding() {
  isSavingTrackedConditions.value = true
  trackedConditionsError.value = ''

  try {
    await completeOnboarding(draftSelectedKeys.value)
    await syncFreeConditionWithTrackedKeys(draftSelectedKeys.value)
    isConditionBrowserOpen.value = false
  } catch (error) {
    trackedConditionsError.value = getErrorMessage(error)
  } finally {
    isSavingTrackedConditions.value = false
  }
}

async function finishConditionBrowser() {
  isSavingTrackedConditions.value = true
  trackedConditionsError.value = ''

  try {
    await updateTrackedConditions(draftSelectedKeys.value)
    await syncFreeConditionWithTrackedKeys(draftSelectedKeys.value)
    isConditionBrowserOpen.value = false
  } catch (error) {
    trackedConditionsError.value = getErrorMessage(error)
  } finally {
    isSavingTrackedConditions.value = false
  }
}

async function loadEntries() {
  if (!user.value) {
    savedEntries.value = []
    homeSortUsesEntryDates.value = false
    isSubmissionDropdownOpen.value = false
    lastSeenSubmissionAt.value = ''
    highlightedSubmissionId.value = null
    return
  }

  isLoadingEntries.value = true
  entriesError.value = ''

  try {
    const { listEntries } = useSymptomEntries()
    savedEntries.value = await listEntries()
    syncSubmissionSeenState(savedEntries.value)
    refreshMonthlyBackupReminder()
    await refreshTrackedConditions()
  } catch (error) {
    entriesError.value = getErrorMessage(error)
  } finally {
    isLoadingEntries.value = false
    homeSortUsesEntryDates.value = true
    scheduleLogReminderCheck()
  }
}

function getSubmissionSeenKey() {
  return user.value ? `symptom-tracker-submissions-seen:${user.value.id}` : ''
}

function loadSubmissionSeenState() {
  if (!import.meta.client) {
    return
  }

  const key = getSubmissionSeenKey()
  const legacyKey = user.value ? `symptom-tracker-family-submissions-seen:${user.value.id}` : ''
  lastSeenSubmissionAt.value = key
    ? window.localStorage.getItem(key) || (legacyKey ? window.localStorage.getItem(legacyKey) || '' : '')
    : ''
}

function markSubmissionSeenUpTo(createdAt: string) {
  if (!import.meta.client || !createdAt) {
    return
  }

  const key = getSubmissionSeenKey()
  if (!key) {
    return
  }

  const currentSeenTime = lastSeenSubmissionAt.value
    ? new Date(lastSeenSubmissionAt.value).getTime()
    : 0
  const createdTime = new Date(createdAt).getTime()

  if (createdTime > currentSeenTime) {
    lastSeenSubmissionAt.value = createdAt
    window.localStorage.setItem(key, createdAt)
  }
}

function syncSubmissionSeenState(entries: any[]) {
  loadSubmissionSeenState()

  if (!import.meta.client || !user.value) {
    return
  }

  const key = getSubmissionSeenKey()
  if (!key || lastSeenSubmissionAt.value || !entries.length) {
    return
  }

  const newestCreatedAt = entries
    .map((entry) => entry.created_at || entry.occurred_at)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]

  if (newestCreatedAt) {
    markSubmissionSeenUpTo(newestCreatedAt)
  }
}

function scheduleSubmissionHighlightClear() {
  if (submissionHighlightTimer) {
    clearTimeout(submissionHighlightTimer)
  }

  submissionHighlightTimer = setTimeout(() => {
    highlightedSubmissionId.value = null
  }, submissionHighlightDurationMs)
}

async function scrollHistoryEntryIntoView(entryId: string) {
  await nextTick()

  if (!import.meta.client) {
    return
  }

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })

  const container = historyScrollEl.value
  const entryElement = container?.querySelector(`[data-entry-id="${entryId}"]`) as HTMLElement | null

  if (!container || !entryElement) {
    return
  }

  const scrollTarget = entryElement.getBoundingClientRect().top
    - container.getBoundingClientRect().top
    + container.scrollTop

  container.scrollTo({
    top: Math.max(0, scrollTarget - 4),
    behavior: 'smooth'
  })
}

function markSubmissionsSeen() {
  if (!import.meta.client) {
    return
  }

  const newestSubmission = submissionNotifications.value[0]
  const key = getSubmissionSeenKey()

  if (!newestSubmission?.createdAt || !key) {
    return
  }

  lastSeenSubmissionAt.value = newestSubmission.createdAt
  window.localStorage.setItem(key, newestSubmission.createdAt)
}

function toggleSubmissionDropdown() {
  isSubmissionDropdownOpen.value = !isSubmissionDropdownOpen.value

  if (isSubmissionDropdownOpen.value) {
    markSubmissionsSeen()
  }
}

function closeSubmissionDropdown() {
  isSubmissionDropdownOpen.value = false
}

async function focusSubmission(entryId: string) {
  activeHistoryTab.value = 'Entries'
  const wasCollapsed = !historyExpanded.value
  expandHistorySheet()
  isSubmissionDropdownOpen.value = false
  highlightedSubmissionId.value = entryId
  scheduleSubmissionHighlightClear()

  const submission = submissionNotifications.value.find((item) => item.id === entryId)
  if (submission?.createdAt) {
    markSubmissionSeenUpTo(submission.createdAt)
  }

  if (wasCollapsed) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 420)
    })
  }
  await scrollHistoryEntryIntoView(entryId)
}

async function saveEntry() {
  if (!user.value) {
    entryError.value = 'Please sign in before saving symptom entries.'
    isAuthPanelOpen.value = true
    return
  }

  if (!validateEntryDateTimeStep()) {
    return
  }

  const entryConditionKey = conditionKey(entryTitle.value)

  if (!isPro.value && !editingEntryId.value && !canTrackCondition(entryConditionKey)) {
    if (canAddFreeCondition(entryConditionKey)) {
      try {
        await addFreeCondition(entryConditionKey)
      } catch (error) {
        entryError.value = getErrorMessage(error)
        return
      }
    } else if (canReplaceFreeCondition(entryConditionKey, savedEntries.value.length)) {
      try {
        await replaceFreeCondition(entryConditionKey, savedEntries.value.length)
      } catch (error) {
        entryError.value = getErrorMessage(error)
        return
      }
    } else {
      openUpgradePrompt(
        'Free plan: 1 condition',
        `Free lets you pick ${FREE_CONDITION_LIMIT} condition with unlimited entries. Upgrade to Pro for ${PRO_ANNUAL_PRICE_LABEL} to track more conditions, family reporting, and advanced charts in PDF exports.`
      )
      return
    }
  }

  isSavingEntry.value = true
  entryError.value = ''

  try {
    const wasEditing = Boolean(editingEntryId.value)
    const { createEntry, updateEntry } = useSymptomEntries()
    const details = { ...entryForm.value }
    const occurredAt = entryForm.value.date_and_time
      ? new Date(entryForm.value.date_and_time).toISOString()
      : null
    const payload = {
      condition_key: conditionKey(entryTitle.value),
      condition_label: entryTitle.value,
      severity: severityValue.value,
      occurred_at: occurredAt,
      summary: entryForm.value.what_happened || entryForm.value.condition_name || entryTitle.value,
      impact: entryForm.value.daily_impact || null,
      details
    }

    let savedEntryId: string | null = null

    if (editingEntryId.value) {
      await updateEntry(editingEntryId.value, payload)
    } else {
      const savedEntry = await createEntry(payload)
      savedEntryId = savedEntry?.id || null
    }

    hasActiveDraft.value = false
    clearPersistedEntryDraft()
    closeEntryPanel(true)
    await loadEntries()
    await syncHomeConditionsAfterEntrySave(payload.condition_key)
    await loadEntitlements()

    if (!wasEditing && savedEntryId && isMobileLayout.value) {
      await focusSubmission(savedEntryId)
    }

    showSubmissionToast({
      message: wasEditing ? 'Entry updated.' : 'Entry saved.',
      highlight: wasEditing ? undefined : '+1'
    })
  } catch (error) {
    entryError.value = getErrorMessage(error)
  } finally {
    isSavingEntry.value = false
  }
}

async function archiveEntry(id: string) {
  if (!user.value) {
    entriesError.value = 'Please sign in to manage entries.'
    isAuthPanelOpen.value = true
    return
  }

  entriesError.value = ''

  const entry = savedEntries.value.find((item) => item.id === id)
  if (!entry) {
    return
  }

  try {
    archiveDeletedEntry(user.value.id, entry)

    const { deleteEntry } = useSymptomEntries()
    await deleteEntry(id)
    await loadEntries()
  } catch (error) {
    entriesError.value = getErrorMessage(error)
  }
}

function requestDeleteEntry(id: string) {
  const entry = historyEntries.value.find((item) => item.id === id)
  if (!entry) {
    return
  }

  pendingDelete.value = {
    id,
    mode: 'archive',
    title: entry.title
  }
}

function cancelDeleteEntry() {
  pendingDelete.value = null
}

async function confirmDeleteEntry() {
  if (!pendingDelete.value) {
    return
  }

  const { id } = pendingDelete.value
  pendingDelete.value = null
  await archiveEntry(id)
}

function openShareLinkForEntry(entryId: string) {
  if (!user.value) {
    isAuthPanelOpen.value = true
    return
  }

  if (!canUseFamilyReporting.value) {
    openUpgradePrompt(
      'Family reporting is a Pro feature',
      'Create private links so spouses, caregivers, or family can submit signed observations for your claim.'
    )
    return
  }

  const entry = savedEntries.value.find((item) => item.id === entryId)
  if (!entry || entry.source === 'family') {
    return
  }

  shareLinkEntry.value = entry
  shareLinkLabel.value = ''
  shareLinkCreatedUrl.value = ''
  shareLinkCopied.value = false
  shareLinkError.value = ''
  isShareLinkOpen.value = true
}

function closeShareLinkModal() {
  isShareLinkOpen.value = false
  shareLinkEntry.value = null
  shareLinkLabel.value = ''
  shareLinkCreatedUrl.value = ''
  shareLinkCopied.value = false
  shareLinkError.value = ''
}

async function createShareLinkForEntry() {
  if (!shareLinkEntry.value) {
    return
  }

  isCreatingShareLink.value = true
  shareLinkError.value = ''

  try {
    const { createSupporterProfile } = useUserProfiles()
    const { token } = await createSupporterProfile({
      link_label: shareLinkLabel.value,
      visible_conditions: [shareLinkEntry.value.condition_label],
      linked_entry_id: shareLinkEntry.value.id,
      entry_context_summary: shareLinkEntry.value.summary || shareLinkEntry.value.condition_label
    })
    shareLinkCreatedUrl.value = `${window.location.origin}/report/${token}`
    shareLinkCopied.value = false
  } catch (error) {
    shareLinkError.value = getErrorMessage(error)
  } finally {
    isCreatingShareLink.value = false
  }
}

async function copyShareLink() {
  if (!shareLinkCreatedUrl.value) {
    return
  }

  const copied = await copyToClipboard(shareLinkCreatedUrl.value)
  shareLinkCopied.value = copied
  if (!copied) {
    shareLinkError.value = 'Could not copy link. Copy it manually.'
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

function openUpgradePrompt(title: string, description: string) {
  upgradePromptTitle.value = title
  upgradePromptDescription.value = description
  isUpgradePromptOpen.value = true
}

function closeUpgradePrompt() {
  isUpgradePromptOpen.value = false
}

async function handleUpgradeCheckout() {
  isUpgradeCheckoutLoading.value = true

  try {
    closeUpgradePrompt()
    await router.push('/upgrade?checkout=1')
  } catch (error) {
    exportError.value = getErrorMessage(error)
  } finally {
    isUpgradeCheckoutLoading.value = false
  }
}

function toggleAuthPanel() {
  isAuthPanelOpen.value = !isAuthPanelOpen.value
}

async function handleAuthSubmit() {
  authMessage.value = ''
  authError.value = ''
  needsEmailConfirmation.value = false

  if (authMode.value === 'signup' && !authName.value.trim()) {
    authMessage.value = 'Enter your full name.'
    return
  }

  if (authMode.value === 'signup' && authPassword.value.length < 6) {
    authMessage.value = 'Password must be at least 6 characters.'
    return
  }

  if (authMode.value === 'signup' && authPassword.value !== authConfirmPassword.value) {
    authMessage.value = 'Passwords do not match.'
    return
  }

  isAuthSubmitting.value = true

  try {
    if (authMode.value === 'login') {
      await signIn(authEmail.value, authPassword.value)
      showSubmissionToast('Signed in.')
      isAuthPanelOpen.value = false
    } else {
      const data = await signUp(authEmail.value, authPassword.value, authName.value.trim())

      if (data.session || user.value) {
        showSubmissionToast('Account created. You are signed in.')
        isAuthPanelOpen.value = false
      } else if (data.user) {
        authMessage.value = 'Account created, but sign-in did not start. Try Sign in with the same password.'
      } else {
        authMessage.value = 'Signup did not return a user. Check Supabase Auth settings and try again.'
      }
    }
  } catch {
    if (/already exists|already has a VCH account/i.test(authError.value)) {
      authMode.value = 'login'
    }
    if (/confirm your email/i.test(authError.value)) {
      needsEmailConfirmation.value = true
    }
    authMessage.value = authError.value || 'Could not sign in. Check your email and password.'
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleResendConfirmation() {
  if (!authEmail.value) {
    authMessage.value = 'Enter your email first, then tap Resend confirmation email.'
    return
  }

  isAuthSubmitting.value = true
  authMessage.value = ''
  authError.value = ''

  try {
    await resendConfirmationEmail(authEmail.value)
    needsEmailConfirmation.value = true
    authMessage.value = 'Confirmation email sent again. Check spam for mail from Supabase.'
    showSubmissionToast('Confirmation email sent.')
  } catch {
    authMessage.value = authError.value || 'Could not resend the confirmation email.'
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleGoogleSignIn() {
  isAuthSubmitting.value = true
  authMessage.value = ''

  try {
    if (import.meta.client) {
      window.sessionStorage.setItem('symptom-tracker-auth-success', 'google')
    }
    await signInWithGoogle()
  } catch {
    authMessage.value = authError.value || 'Could not sign in. Check your email and password.'
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleForgotPassword() {
  authMessage.value = ''
  authError.value = ''

  if (!authEmail.value.trim()) {
    authMessage.value = 'Enter your email first, then tap Forgot password again.'
    return
  }

  isAuthSubmitting.value = true

  try {
    await sendPasswordReset(authEmail.value)
    showSubmissionToast('Password reset email sent. Check spam if it does not arrive.')
  } catch {
    authMessage.value = authError.value || 'Could not send the reset email.'
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
    closeEntryPanel(true, true)
    refreshEntryDraftPreview()
  } catch {
    authMessage.value = authError.value || 'Could not sign out.'
  } finally {
    isAuthSubmitting.value = false
  }
}

function logHomeCondition(condition: HomeCondition) {
  openEntryPanel({
    condition: {
      title: condition.title,
      category: condition.category,
      description: condition.description,
      image: condition.image
    }
  })
}

function showPreviousCondition() {
  if (!homeConditions.value.length) {
    return
  }

  const lastIndex = homeConditions.value.length

  transitionDirection.value = 'previous'
  closeEntryPanel()
  activeIndex.value = activeIndex.value === 0 ? lastIndex : activeIndex.value - 1
}

function showNextCondition() {
  if (!homeConditions.value.length) {
    return
  }

  const lastIndex = homeConditions.value.length

  transitionDirection.value = 'next'
  closeEntryPanel()
  activeIndex.value = activeIndex.value === lastIndex ? 0 : activeIndex.value + 1
}

function showSlide(index: number) {
  const lastIndex = homeConditions.value.length

  if (index === activeIndex.value || index < 0 || index > lastIndex) {
    return
  }

  selectedSearchCondition.value = null
  transitionDirection.value = index > activeIndex.value ? 'next' : 'previous'
  closeEntryPanel()
  activeIndex.value = index
}

function handleCancelEntry() {
  if (
    isMeaningfulEntryDraft({
      entryStep: entryStep.value,
      entryForm: entryForm.value,
      selectedSearchCondition: selectedSearchCondition.value,
      customConditionInput: customConditionInput.value
    })
  ) {
    closeEntryPanel()
    return
  }

  closeEntryPanel(true)
}

function startEntryFromCurrentSlide() {
  if (
    suppressConditionTap
    || !isConditionSlideEntryEnabled.value
    || isHomeOverviewSlide.value
    || isHistoryEntryActivationLocked()
  ) {
    return
  }

  const condition = activeCondition.value
  if (!condition) {
    return
  }

  logHomeCondition(condition)
}

function changeEntryCondition(condition: { title: string, category: string, description: string, image: string }) {
  if (condition.title === entryTitle.value) {
    isConditionPickerOpen.value = false
    return
  }

  selectedSearchCondition.value = condition
  editingEntryConditionLabel.value = null

  if (entryForm.value.condition_name) {
    delete entryForm.value.condition_name
  }

  customConditionInput.value = ''
  entryStep.value = 0
  isConditionPickerOpen.value = false

  if (!isPro.value && !editingEntryId.value) {
    ensureFreeConditionAccess(
      conditionKeyFromLabel(condition.title),
      condition.title,
      null
    )
  }
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
  editingEntryConditionLabel.value = null
  entryForm.value.condition_name = customName
  entryStep.value = 0
  isConditionPickerOpen.value = false

  if (!isPro.value && !editingEntryId.value) {
    ensureFreeConditionAccess(
      conditionKeyFromLabel(customName),
      customName,
      null
    )
  }
}

function toggleConditionPicker() {
  isConditionPickerOpen.value = !isConditionPickerOpen.value

  if (isConditionPickerOpen.value) {
    customConditionInput.value = selectedSearchCondition.value
      ? ''
      : (entryForm.value.condition_name?.trim() || '')
    debouncedCustomConditionPreview.value = customConditionInput.value
    return
  }

  customConditionInput.value = ''
  debouncedCustomConditionPreview.value = ''
}

function selectSearchCondition(condition: { title: string, category: string, description: string, image: string }) {
  openEntryPanel({ condition })
}

function expandHistorySheet() {
  if (!historyExpanded.value) {
    blockConditionSlideEntry(HISTORY_TRANSITION_LOCK_MS)
    historyExpanded.value = true
    lockHistoryTransition()
  }
}

function collapseHistorySheet() {
  if (!historyExpanded.value) {
    return
  }

  historyExpanded.value = false
  historyScrollEl.value?.scrollTo({ top: 0 })
  lockHistoryTransition()
}

function selectHistoryTab(tab: string) {
  if (activeHistoryTab.value === tab && historyExpanded.value) {
    return
  }

  lockHistoryEntryActivation()
  blockConditionSlideEntry(HISTORY_ENTRY_ACTIVATION_LOCK_MS)

  if (!historyExpanded.value) {
    expandHistorySheet()
  }

  if (tab === 'Export') {
    ensureExportConditionSelection()
  }

  activeHistoryTab.value = tab
}

const HISTORY_DRAG_ACTIVATE_PX = 8
const HISTORY_DRAG_SNAP_PX = 32
const HISTORY_TRANSITION_LOCK_MS = 560

let historyTransitionLockUntil = 0

function lockHistoryTransition(durationMs = HISTORY_TRANSITION_LOCK_MS) {
  historyTransitionLockUntil = Date.now() + durationMs
}

function isHistoryTransitionLocked() {
  return Date.now() < historyTransitionLockUntil
}

let historyPointerId: number | null = null
let historyPointerStartY = 0
let historyPointerDeltaY = 0
let historyPointerStartedOnInteractive = false

function resetHistoryPointer() {
  historyPointerId = null
  historyPointerStartY = 0
  historyPointerDeltaY = 0
  historyPointerStartedOnInteractive = false
}

function handleHistoryPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return
  }

  const target = event.target as HTMLElement

  historyPointerStartedOnInteractive = Boolean(
    target.closest('[data-history-interactive]')
  )

  if (historyPointerStartedOnInteractive) {
    return
  }

  if (historyExpanded.value && historyScrollEl.value?.contains(target)) {
    return
  }

  historyPointerId = event.pointerId
  historyPointerStartY = event.clientY
  historyPointerDeltaY = 0
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
}

function handleHistoryPointerMove(event: PointerEvent) {
  if (historyPointerId !== event.pointerId || historyPointerStartedOnInteractive) {
    return
  }

  historyPointerDeltaY = historyPointerStartY - event.clientY

  if (!historyExpanded.value && historyPointerDeltaY > HISTORY_DRAG_ACTIVATE_PX) {
    expandHistorySheet()
  }

  if (
    historyExpanded.value
    && historyPointerDeltaY < -HISTORY_DRAG_ACTIVATE_PX
    && (historyScrollEl.value?.scrollTop ?? 0) <= 0
  ) {
    collapseHistorySheet()
  }
}

function handleHistoryPointerUp(event: PointerEvent) {
  if (historyPointerId !== event.pointerId) {
    return
  }

  const target = event.currentTarget as HTMLElement
  if (target.hasPointerCapture?.(event.pointerId)) {
    target.releasePointerCapture(event.pointerId)
  }

  if (!historyPointerStartedOnInteractive) {
    const delta = historyPointerDeltaY

    if (Math.abs(delta) < HISTORY_DRAG_ACTIVATE_PX) {
      lockHistoryEntryActivation()
      blockConditionSlideEntry(HISTORY_ENTRY_ACTIVATION_LOCK_MS)
      if (historyExpanded.value) {
        collapseHistorySheet()
      } else {
        expandHistorySheet()
      }
    } else if (delta > HISTORY_DRAG_SNAP_PX) {
      lockHistoryEntryActivation()
      blockConditionSlideEntry(HISTORY_ENTRY_ACTIVATION_LOCK_MS)
      expandHistorySheet()
    } else if (delta < -HISTORY_DRAG_SNAP_PX) {
      lockHistoryEntryActivation()
      blockConditionSlideEntry(HISTORY_ENTRY_ACTIVATION_LOCK_MS)
      collapseHistorySheet()
    }
  }

  resetHistoryPointer()
}

function handleHistoryPointerCancel() {
  resetHistoryPointer()
}

let conditionSwipeStartX = 0
let conditionSwipeStartY = 0
let conditionSwipeAxis: 'horizontal' | 'vertical' | null = null
let suppressConditionTap = false
let conditionSwipeStartedInScrollList = false
let historyEntryActivationLockUntil = 0
const HISTORY_ENTRY_ACTIVATION_LOCK_MS = 450

function blockConditionSlideEntry(durationMs = HISTORY_ENTRY_ACTIVATION_LOCK_MS) {
  conditionSlideEntryBlocked.value = true

  if (conditionSlideEntryBlockedTimer) {
    clearTimeout(conditionSlideEntryBlockedTimer)
  }

  conditionSlideEntryBlockedTimer = setTimeout(() => {
    conditionSlideEntryBlocked.value = historyExpanded.value
    conditionSlideEntryBlockedTimer = undefined
  }, durationMs)
}

function lockHistoryEntryActivation() {
  historyEntryActivationLockUntil = Date.now() + HISTORY_ENTRY_ACTIVATION_LOCK_MS
}

function isHistoryEntryActivationLocked() {
  return Date.now() < historyEntryActivationLockUntil
}

function suppressConditionTapBriefly() {
  suppressConditionTap = true
  blockConditionSlideEntry(320)
  window.setTimeout(() => {
    suppressConditionTap = false
  }, 320)
}

function handleConditionSwipeStart(event: TouchEvent) {
  if (isDesktopLayout.value || showConditionBrowser.value) {
    return
  }

  const target = event.target as HTMLElement
  conditionSwipeStartedInScrollList = Boolean(target.closest('[data-home-conditions-scroll]'))
  conditionSwipeStartX = event.touches[0]?.clientX ?? 0
  conditionSwipeStartY = event.touches[0]?.clientY ?? 0
  conditionSwipeAxis = null
  suppressConditionTap = false
}

function handleConditionSwipeEnd(event: TouchEvent) {
  if (isDesktopLayout.value || showConditionBrowser.value) {
    return
  }

  const touch = event.changedTouches[0]
  if (!touch) {
    return
  }

  const deltaX = touch.clientX - conditionSwipeStartX
  const deltaY = conditionSwipeStartY - touch.clientY

  if (!conditionSwipeAxis) {
    if (Math.abs(deltaX) < 12 && Math.abs(deltaY) < 12) {
      return
    }

    conditionSwipeAxis = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical'
  }

  if (conditionSwipeAxis === 'horizontal') {
    if (Math.abs(deltaX) >= 50) {
      suppressConditionTapBriefly()

      if (deltaX < -50) {
        showNextCondition()
      } else if (deltaX > 50) {
        showPreviousCondition()
      }
    }
    return
  }

  if (
    deltaY > 36
    && !historyExpanded.value
    && !isHomeOverviewSlide.value
    && !conditionSwipeStartedInScrollList
    && !isConditionScrolling.value
  ) {
    lockHistoryEntryActivation()
    suppressConditionTapBriefly()
    expandHistorySheet()
  }

  conditionSwipeStartedInScrollList = false
}

let entrySwipeStartX = 0
let entrySwipeStartY = 0
let entrySwipeStartedOnControl = false

function isStepSwipeBlockedTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(target.closest(
    'input, textarea, select, button, [role="slider"], [data-step-swipe-block]'
  ))
}

function handleEntrySwipeStart(event: TouchEvent) {
  if (isDesktopLayout.value) {
    return
  }

  entrySwipeStartedOnControl = isStepSwipeBlockedTarget(event.target)
  entrySwipeStartX = event.touches[0]?.clientX ?? 0
  entrySwipeStartY = event.touches[0]?.clientY ?? 0
}

function handleEntrySwipeEnd(event: TouchEvent) {
  if (isDesktopLayout.value) {
    return
  }

  if (entrySwipeStartedOnControl || currentStepHasSliderField()) {
    entrySwipeStartedOnControl = false
    return
  }

  const touch = event.changedTouches[0]
  if (!touch) {
    return
  }

  const deltaX = touch.clientX - entrySwipeStartX
  const deltaY = Math.abs(touch.clientY - entrySwipeStartY)

  if (Math.abs(deltaX) < 50 || Math.abs(deltaX) <= deltaY) {
    return
  }

  if (deltaX < 0 && !isLastEntryStep.value) {
    handleEntryNextStep()
    return
  }

  if (deltaX > 0 && entryStep.value > 0) {
    showPreviousEntryStep()
  }
}

let historyTabSwipeStartX = 0

function handleHistoryTabSwipeStart(event: TouchEvent) {
  if (isDesktopLayout.value) {
    return
  }

  historyTabSwipeStartX = event.touches[0]?.clientX ?? 0
}

function handleHistoryTabSwipeEnd(event: TouchEvent) {
  if (isDesktopLayout.value) {
    return
  }

  const touch = event.changedTouches[0]
  if (!touch) {
    return
  }

  const deltaX = touch.clientX - historyTabSwipeStartX

  if (Math.abs(deltaX) < 40) {
    return
  }

  const currentIndex = historyTabs.indexOf(activeHistoryTab.value)

  if (deltaX < 0 && currentIndex < historyTabs.length - 1) {
    selectHistoryTab(historyTabs[currentIndex + 1])
    return
  }

  if (deltaX > 0 && currentIndex > 0) {
    selectHistoryTab(historyTabs[currentIndex - 1])
  }
}

let calendarSwipeStartX = 0

function handleCalendarSwipeStart(event: TouchEvent) {
  if (isDesktopLayout.value) {
    return
  }

  calendarSwipeStartX = event.touches[0]?.clientX ?? 0
}

function handleCalendarSwipeEnd(event: TouchEvent) {
  if (isDesktopLayout.value) {
    return
  }

  const touch = event.changedTouches[0]
  if (!touch) {
    return
  }

  const deltaX = touch.clientX - calendarSwipeStartX

  if (Math.abs(deltaX) < 40) {
    return
  }

  if (deltaX < 0 && canShowNextHistoryMonth.value) {
    showNextHistoryMonth()
    return
  }

  if (deltaX > 0) {
    showPreviousHistoryMonth()
  }
}

function handleConditionScroll() {
  isConditionScrolling.value = true

  if (conditionScrollTimer) {
    clearTimeout(conditionScrollTimer)
  }

  conditionScrollTimer = setTimeout(() => {
    isConditionScrolling.value = false
  }, 350)

  if (historyExpanded.value && !isHistoryTransitionLocked()) {
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
  if (!historyExpanded.value || isDesktopLayout.value) {
    return
  }

  const currentY = event.touches[0]?.clientY ?? 0
  const deltaY = Math.abs(conditionTouchStartY - currentY)

  if (deltaY > 8) {
    collapseHistorySheet()
  }
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

function resolvePendingEntryConditionKey(options: {
  prefillCustomCondition?: string
  condition?: { title: string }
} = {}) {
  if (options.condition?.title) {
    return conditionKey(options.condition.title)
  }

  if (options.prefillCustomCondition) {
    return conditionKey(options.prefillCustomCondition)
  }

  return ''
}

function resolveEntryConditionLabel(label: string) {
  const normalizedLabel = normalizeConditionLabel(label)
  const searchMatch = conditionResults.find((condition) => condition.title === normalizedLabel)
  if (searchMatch) {
    return {
      searchCondition: searchMatch,
      conditionLabel: null as string | null,
      customName: null as string | null
    }
  }

  if (normalizedLabel in entryFieldsByCondition) {
    return {
      searchCondition: null,
      conditionLabel: normalizedLabel,
      customName: null
    }
  }

  return {
    searchCondition: null,
    conditionLabel: null,
    customName: normalizedLabel
  }
}

function populateEntryFormFromRecord(entry: Record<string, any>) {
  const details = {
    ...(entry.details || {})
  } as Record<string, string>

  if (entry.summary && !details.what_happened) {
    details.what_happened = entry.summary
  }

  if (entry.impact && !details.daily_impact) {
    details.daily_impact = entry.impact
  }

  if (!details.date_and_time && entry.occurred_at) {
    details.date_and_time = toLocalDateTimeInputValue(new Date(entry.occurred_at))
  }

  entryForm.value = details
  severityValue.value = entry.severity ?? 5
  syncEntryInputsFromForm()
}

function handleProfileClick() {
  if (user.value) {
    if (isEmbeddedPreview) {
      openEmbedProfile()
      return
    }

    router.push('/profile')
    return
  }

  toggleAuthPanel()
}

function openEntryForEdit(entryId: string) {
  if (isHistoryEntryActivationLocked()) {
    return
  }

  if (!user.value) {
    isAuthPanelOpen.value = true
    return
  }
  const entry = savedEntries.value.find((item) => item.id === entryId)
  if (!entry) {
    return
  }

  const resolved = resolveEntryConditionLabel(entry.condition_label)
  editingEntryId.value = entryId
  editingEntryConditionLabel.value = resolved.conditionLabel
  selectedSearchCondition.value = resolved.searchCondition
  customConditionInput.value = ''
  debouncedCustomConditionPreview.value = ''
  isConditionPickerOpen.value = false
  historyExpanded.value = false
  transitionDirection.value = 'expand'
  entryStep.value = 0
  entryError.value = ''
  hasActiveDraft.value = true
  isEntryOpen.value = true

  resetEntryForm()
  populateEntryFormFromRecord(entry)

  if (resolved.customName) {
    entryForm.value.condition_name = resolved.customName
  }
}

function openConditionSlotModal(options: {
  conditionKey: string
  conditionLabel: string
  mode: 'add' | 'replace'
  entryPanelOptions?: {
    prefillCustomCondition?: string
    condition?: {
      title: string
      category: string
      description: string
      image: string
    }
  } | null
}) {
  pendingEntryPanelOptions.value = options.entryPanelOptions ?? null
  pendingConditionSlotKey.value = options.conditionKey
  pendingConditionSlotLabel.value = options.conditionLabel
  pendingConditionSlotMode.value = options.mode
  conditionSlotError.value = ''
  isConditionSlotOpen.value = true
}

function ensureFreeConditionAccess(
  conditionKey: string,
  conditionLabel: string,
  entryPanelOptions: {
    prefillCustomCondition?: string
    condition?: {
      title: string
      category: string
      description: string
      image: string
    }
  } | null = null
) {
  if (isPro.value || canTrackCondition(conditionKey)) {
    return true
  }

  const loggedEntryCount = savedEntries.value.length

  if (canAddFreeCondition(conditionKey)) {
    openConditionSlotModal({
      conditionKey,
      conditionLabel,
      mode: 'add',
      entryPanelOptions
    })
    return false
  }

  if (canReplaceFreeCondition(conditionKey, loggedEntryCount)) {
    openConditionSlotModal({
      conditionKey,
      conditionLabel,
      mode: 'replace',
      entryPanelOptions
    })
    return false
  }

  openUpgradePrompt(
    'Free plan: 1 condition',
    `You already picked ${freeConditionLabels.value[0] || 'your free condition'}. Upgrade to Pro for ${PRO_ANNUAL_PRICE_LABEL} to track ${conditionLabel || formatConditionKeyLabel(conditionKey)} and more.`
  )
  return false
}

function openEntryPanel(options: {
  prefillCustomCondition?: string
  condition?: {
    title: string
    category: string
    description: string
    image: string
  }
} = {}) {
  if (!user.value) {
    isAuthPanelOpen.value = true
    return
  }

  if (isPro.value) {
    requestEntryPanelOpen(options)
    return
  }

  const pendingConditionKey = resolvePendingEntryConditionKey(options)
  const pendingConditionLabel = options.condition?.title || options.prefillCustomCondition || ''

  if (!pendingConditionKey) {
    requestEntryPanelOpen(options)
    return
  }

  if (ensureFreeConditionAccess(pendingConditionKey, pendingConditionLabel || formatConditionKeyLabel(pendingConditionKey), options)) {
    requestEntryPanelOpen(options)
  }
}

function requestEntryPanelOpen(options: {
  prefillCustomCondition?: string
  condition?: {
    title: string
    category: string
    description: string
    image: string
  }
} = {}) {
  const caution = getWeeklyLogCaution(weeklyLogDay.value, loggingCadence.value)

  if (caution) {
    pendingCadenceEntryOptions.value = options
    weeklyLogCaution.value = caution
    isLoggingCadencePromptOpen.value = true
    return
  }

  openEntryPanelInner(options)
}

function closeLoggingCadencePrompt() {
  isLoggingCadencePromptOpen.value = false
  weeklyLogCaution.value = null
  pendingCadenceEntryOptions.value = null
}

function confirmLoggingCadencePrompt() {
  const options = pendingCadenceEntryOptions.value || {}
  closeLoggingCadencePrompt()
  openEntryPanelInner(options)
}

async function handleWelcomeComplete(payload: {
  loggingCadence: 'daily' | 'weekly'
  weeklyLogDay: number
  termsAcceptedAt: string
  enableLogReminders: boolean
  reminderHour: number
  reminderTimezone: string
}) {
  try {
    await completeAppWelcome(payload)
    hydrateReminderSettings({
      log_reminders_enabled: payload.enableLogReminders,
      reminder_hour: payload.reminderHour,
      reminder_timezone: payload.reminderTimezone
    })

    if (payload.enableLogReminders) {
      const result = await enableRemindersWithPermission()

      if (!result.ok) {
        await persistReminderSettings({
          enabled: false,
          hour: payload.reminderHour,
          timezone: payload.reminderTimezone
        })
      }
    }

    showSubmissionToast('Welcome! You are all set.')
  } catch (error) {
    console.error(error)
  }
}

function openEntryPanelInner(options: {
  prefillCustomCondition?: string
  condition?: {
    title: string
    category: string
    description: string
    image: string
  }
} = {}) {
  historyExpanded.value = false
  transitionDirection.value = 'expand'
  entryStep.value = 0
  resetEntryForm()
  editingEntryId.value = null
  editingEntryConditionLabel.value = null
  selectedSearchCondition.value = options.condition ?? null
  hasActiveDraft.value = true
  isConditionPickerOpen.value = false
  customConditionInput.value = ''
  debouncedCustomConditionPreview.value = ''

  if (options.prefillCustomCondition) {
    entryForm.value.condition_name = options.prefillCustomCondition
    customConditionInput.value = options.prefillCustomCondition
    debouncedCustomConditionPreview.value = options.prefillCustomCondition
  }

  isEntryOpen.value = true
}

function closeConditionSlotModal() {
  isConditionSlotOpen.value = false
  pendingEntryPanelOptions.value = null
  pendingConditionSlotKey.value = ''
  pendingConditionSlotLabel.value = ''
  pendingConditionSlotMode.value = 'add'
  conditionSlotError.value = ''
}

async function confirmConditionSlot() {
  if (!pendingConditionSlotKey.value) {
    return
  }

  isConfirmingConditionSlot.value = true
  conditionSlotError.value = ''

  try {
    if (pendingConditionSlotMode.value === 'replace') {
      await replaceFreeCondition(pendingConditionSlotKey.value, savedEntries.value.length)
    } else {
      await addFreeCondition(pendingConditionSlotKey.value)
    }

    const options = pendingEntryPanelOptions.value
    closeConditionSlotModal()

    if (options) {
      openEntryPanelInner(options)
    }
  } catch (error) {
    conditionSlotError.value = getErrorMessage(error)
  } finally {
    isConfirmingConditionSlot.value = false
  }
}

function closeEntryPanel(clearDraft = false, preservePersistedDraft = false) {
  const wasEntryOpen = isEntryOpen.value

  if (isEntryOpen.value && !clearDraft && !editingEntryId.value) {
    persistEntryDraftNow()
  }

  if (isEntryOpen.value) {
    transitionDirection.value = 'collapse'
  }

  if (clearDraft) {
    hasActiveDraft.value = false

    if (!preservePersistedDraft) {
      clearPersistedEntryDraft()
    }

    editingEntryId.value = null
    editingEntryConditionLabel.value = null
    selectedSearchCondition.value = null
    isConditionPickerOpen.value = false
    customConditionInput.value = ''
    debouncedCustomConditionPreview.value = ''
    resetEntryForm()
  } else if (!editingEntryId.value) {
    hasActiveDraft.value = isMeaningfulEntryDraft({
      entryStep: entryStep.value,
      entryForm: entryForm.value,
      selectedSearchCondition: selectedSearchCondition.value,
      customConditionInput: customConditionInput.value
    })

    if (!hasActiveDraft.value) {
      selectedSearchCondition.value = null
      customConditionInput.value = ''
      debouncedCustomConditionPreview.value = ''
      isConditionPickerOpen.value = false
      clearPersistedEntryDraft()
    }

    refreshEntryDraftPreview()
  } else {
    editingEntryId.value = null
    editingEntryConditionLabel.value = null
    selectedSearchCondition.value = null
    isConditionPickerOpen.value = false
    customConditionInput.value = ''
    debouncedCustomConditionPreview.value = ''
  }

  isEntryOpen.value = false

  if (wasEntryOpen) {
    blockConditionSlideEntry(400)
  }
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

function handleEntryNextStep() {
  if (isLastEntryStep.value) {
    return
  }

  if (currentStepHasDateTimeField() && !validateEntryDateTimeStep()) {
    return
  }

  showNextEntryStep()
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

.home-tip-enter-active,
.home-tip-leave-active {
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
}

.home-tip-enter-from {
  opacity: 0;
  transform: translateY(0.35rem);
}

.home-tip-leave-to {
  opacity: 0;
  transform: translateY(-0.35rem);
}

.crisis-line-enter-active,
.crisis-line-leave-active {
  overflow: hidden;
  transition:
    opacity 0.55s ease-in-out,
    transform 0.55s ease-in-out,
    max-height 0.55s ease-in-out,
    margin-top 0.55s ease-in-out;
}

.crisis-line-enter-from,
.crisis-line-leave-to {
  max-height: 0;
  margin-top: 0;
  opacity: 0;
  transform: translateY(0.25rem);
}

.crisis-line-enter-to,
.crisis-line-leave-from {
  max-height: 4.5rem;
  margin-top: 0.75rem;
  opacity: 1;
  transform: translateY(0);
}

.submission-flash {
  animation: submission-flash 1.15s ease-out both;
}

@keyframes submission-flash {
  0% {
    filter: brightness(1);
    transform: scale(1);
  }

  18% {
    filter: brightness(1.08);
    transform: scale(1.01);
  }

  100% {
    filter: brightness(1);
    transform: scale(1);
  }
}
</style>
