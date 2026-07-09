<template>
  <main
    class="flex h-dvh min-h-0 flex-col overflow-hidden bg-slate-950 text-white"
  >
    <section class="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col px-4 pt-4 sm:max-w-lg">
      <header class="sticky top-0 z-40 -mx-4 flex shrink-0 items-center gap-3 border-b border-slate-800 bg-slate-950/95 px-4 pb-4 pt-4 backdrop-blur-md">
        <button
          v-if="closeEmbedProfile"
          type="button"
          class="grid size-10 shrink-0 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
          aria-label="Back to tracker"
          @click="closeEmbedProfile()"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </button>
        <NuxtLink
          v-else
          to="/app"
          class="grid size-10 shrink-0 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
          aria-label="Back to tracker"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </NuxtLink>

        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile</p>
          <h1 class="mt-1 truncate text-xl font-bold tracking-tight text-white">Account Settings</h1>
        </div>

        <p
          v-if="user && autoSaveLabel"
          class="shrink-0 text-xs font-semibold"
          :class="autoSaveState === 'error' ? 'text-red-300' : 'text-slate-400'"
          aria-live="polite"
        >
          {{ autoSaveLabel }}
        </p>
      </header>

      <section v-if="isAuthLoading" class="mt-6 shrink-0 rounded-4xl border border-slate-800 bg-slate-900 p-5">
        <h2 class="text-xl font-bold text-white">Loading account...</h2>
        <p class="mt-2 text-sm leading-6 text-slate-400">
          Checking your saved session.
        </p>
      </section>

      <form v-else-if="!user" class="mt-6 flex min-h-0 flex-1 flex-col" @submit.prevent="handleAuthSubmit">
        <div class="flex-1 overflow-y-auto no-scrollbar">
          <section class="rounded-4xl border border-slate-800 bg-slate-900 p-5">
            <AuthModeTabs v-model="authMode" tone="dark" />

            <p class="mt-3 text-sm leading-6 text-slate-400">
              Sign in to save symptom entries, export reports, and manage deleted logs.
            </p>

            <div class="mt-5 space-y-4">
              <label v-if="authMode === 'signup'" class="block">
                <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Name</span>
                <input
                  v-model="authName"
                  type="text"
                  name="name"
                  autocomplete="name"
                  class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                  placeholder="Your full name"
                  :required="authMode === 'signup'"
                >
              </label>

              <label class="block">
                <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Email</span>
                <input
                  v-model="authEmail"
                  type="email"
                  name="email"
                  autocomplete="email"
                  inputmode="email"
                  autocapitalize="none"
                  class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                  placeholder="you@example.com"
                  required
                >
              </label>

              <label class="block">
                <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Password</span>
                <PasswordInput
                  v-if="authMode === 'login'"
                  key="auth-login-password"
                  v-model="authPassword"
                  name="password"
                  tone="dark"
                  autocomplete="current-password"
                  placeholder="Your password"
                  required
                />
                <PasswordInput
                  v-else
                  key="auth-signup-password"
                  v-model="authPassword"
                  name="password"
                  tone="dark"
                  autocomplete="new-password"
                  placeholder="At least 6 characters"
                  :minlength="6"
                  :revealed="signupPasswordReveal.visible"
                  :countdown="signupPasswordReveal.countdown"
                  @reveal="signupPasswordReveal.start"
                  required
                />
              </label>

              <label v-if="authMode === 'signup'" class="block">
                <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Confirm password</span>
                <PasswordInput
                  v-model="authConfirmPassword"
                  name="confirm-password"
                  autocomplete="new-password"
                  tone="dark"
                  placeholder="Re-enter password"
                  :show-toggle="false"
                  :required="authMode === 'signup'"
                />
              </label>

              <button
                v-if="authMode === 'login'"
                type="button"
                class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-slate-300"
                :disabled="isAuthSubmitting || isEmailCooldownActive"
                @click="handleForgotPassword"
              >
                {{ forgotPasswordLabel }}
              </button>

              <button
                v-if="needsEmailConfirmation"
                type="button"
                class="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-sky-300"
                :disabled="isAuthSubmitting || !authEmail || isEmailCooldownActive"
                @click="handleResendConfirmation"
              >
                {{ resendConfirmationLabel }}
              </button>
            </div>
          </section>
        </div>

        <StickyActionBar tone="dark">
          <p
            v-if="authValidationMessage"
            class="mb-3 text-center text-sm font-medium text-amber-300"
            aria-live="polite"
          >
            {{ authValidationMessage }}
          </p>

          <button
            type="submit"
            class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200 disabled:opacity-60"
            :disabled="isAuthSubmitting"
          >
            {{ isAuthSubmitting ? 'Working...' : authMode === 'login' ? 'Sign in' : 'Create account' }}
          </button>

          <GoogleSignInButton
            class="mt-3"
            :text="authMode === 'signup' ? 'signup_with' : 'signin_with'"
            theme="dark"
            :disabled="isAuthSubmitting"
            @click="handleGoogleSignIn"
          />

          <PasskeySignInButton
            v-if="authMode === 'login' && isPasskeySupported"
            class="mt-3"
            theme="dark"
            :disabled="isAuthSubmitting"
            @click="handlePasskeySignIn"
          />

          <p
            v-else-if="authMode === 'signup' && isPasskeySupported"
            class="mt-3 text-center text-xs leading-5 text-slate-400"
          >
            Prefer passkeys? Create your account first, then add one under Profile &rarr; Passkeys.
          </p>
        </StickyActionBar>
      </form>

      <div v-else class="mt-3 flex min-h-0 flex-1 flex-col">
        <SettingsSectionNav
          :sections="settingsSections"
          :scroll-root="settingsScrollEl"
        />

        <div
          ref="settingsScrollEl"
          class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain no-scrollbar"
        >
        <div class="space-y-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <section id="settings-account" class="scroll-mt-3 rounded-4xl border border-slate-800 bg-slate-900 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Your Info</p>
              <h2 class="mt-1 truncate text-xl font-bold text-white">{{ user.email }}</h2>
              <p v-if="signInMethodLabel" class="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                <UIcon v-if="usesGoogleLogin" name="i-lucide-chrome" class="size-3.5 shrink-0" />
                {{ signInMethodLabel }}
              </p>
            </div>

            <span
              v-if="!entitlementsLoaded"
              class="inline-flex shrink-0 items-center rounded-full bg-slate-800 px-3 py-1.5 ring-1 ring-slate-700"
              aria-hidden="true"
            >
              <span class="inline-block h-3 w-10 animate-pulse rounded-full bg-slate-600/80" />
            </span>
            <span
              v-else
              class="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] ring-1"
              :class="isPro
                ? 'bg-amber-500/20 text-amber-100 ring-amber-400/80 shadow-sm shadow-amber-500/20'
                : 'bg-sky-950 text-sky-200 ring-sky-600/70'"
            >
              <UIcon
                :name="isPro ? 'i-lucide-crown' : 'i-lucide-sparkles'"
                class="size-3.5"
                :class="isPro ? 'text-amber-300' : 'text-sky-300'"
              />
              {{ isPro ? 'Pro' : 'Free' }}
            </span>
          </div>

          <template v-if="entitlementsLoaded">
          <p v-if="!isPro" class="mt-3 text-xs leading-5 text-slate-400">
            Free plan: 1 condition with unlimited entries, calendar logging charts, and entry PDFs with weekly symptom counts. Upgrade for {{ PRO_ANNUAL_PRICE_LABEL }} to unlock more conditions, family reporting, and severity trends in PDFs.
          </p>
          <div v-if="!isPro" class="mt-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Your free conditions</p>
            <p class="mt-1 text-xs leading-5 text-slate-500">
              {{ freeConditionKeys.length }}/{{ FREE_CONDITION_LIMIT }} selected
            </p>
            <div v-if="freeConditionKeyLabels.length" class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="label in freeConditionKeyLabels"
                :key="label"
                class="rounded-full bg-sky-950 px-3 py-1.5 text-xs font-semibold text-sky-200 ring-1 ring-sky-800"
              >
                {{ label }}
              </span>
            </div>
            <p v-else class="mt-3 text-xs leading-5 text-slate-500">
              Pick conditions when you start logging from the tracker home screen.
            </p>
          </div>
          <p v-else-if="renewalLabel && !isComped" class="mt-3 text-xs leading-5 text-amber-100/80">
            Pro renews on {{ renewalLabel }}.
          </p>
          <p v-else-if="isComped" class="mt-3 text-xs leading-5 text-amber-100/80">
            Pro access granted at no cost. Thank you for using the tracker.
          </p>

          <div class="mt-4 flex flex-wrap gap-2">
            <NuxtLink
              to="/upgrade"
              class="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition"
              :class="isPro
                ? 'bg-slate-800 text-white ring-1 ring-slate-700'
                : 'bg-amber-400 text-slate-950 hover:bg-amber-300'"
            >
              <UIcon :name="isPro ? 'i-lucide-receipt' : 'i-lucide-crown'" class="size-4" />
              {{ isPro ? 'Payment center' : `Upgrade — ${PRO_ANNUAL_PRICE_LABEL}` }}
            </NuxtLink>
          </div>
          </template>

          <div class="mt-5 space-y-4">
            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Full name</span>
              <input
                v-model="profileForm.full_name"
                type="text"
                class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                placeholder="Your full name"
              >
            </label>
          </div>
        </section>

        <div class="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded-3xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-center text-sm text-slate-400">
          <span>Issues?</span>
          <button
            type="button"
            class="font-semibold text-sky-300 underline decoration-sky-500/40 underline-offset-2 transition hover:text-sky-200"
            @click="isContactSupportOpen = true"
          >
            Contact us
          </button>
          <span aria-hidden="true" class="text-slate-600">·</span>
          <button
            type="button"
            class="font-semibold text-sky-300 underline decoration-sky-500/40 underline-offset-2 transition hover:text-sky-200"
            @click="isFaqOverlayOpen = true"
          >
            Visit FAQ
          </button>
        </div>

        <div
          v-if="needsAppWelcome"
          class="scroll-mt-3 rounded-4xl border border-teal-500/40 bg-teal-950/40 p-5"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">Setup incomplete</p>
          <p class="mt-2 text-sm leading-6 text-teal-50">
            Finish the quick setup wizard to choose how often you log and accept the terms.
          </p>
          <NuxtLink
            to="/app"
            class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-teal-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300"
          >
            Resume setup
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </NuxtLink>
        </div>

        <section id="settings-logging" class="scroll-mt-3 rounded-4xl border border-slate-800 bg-slate-900 p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Logging rhythm</p>
          <h2 class="mt-1 text-xl font-bold text-white">When you log symptoms</h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            Weekly logging is recommended for PTSD and mental health so you are not revisiting painful events every day.
          </p>

          <div class="mt-4 grid gap-3">
            <button
              type="button"
              class="rounded-3xl border px-4 py-4 text-left transition"
              :class="loggingCadence === 'weekly'
                ? 'border-white bg-slate-800'
                : 'border-slate-700 bg-slate-800/50'"
              @click="saveLoggingCadence('weekly')"
            >
              <span class="block font-bold text-white">End of the week</span>
              <span class="mt-1 block text-sm leading-6 text-slate-400">Log once and capture the week together.</span>
            </button>

            <button
              type="button"
              class="rounded-3xl border px-4 py-4 text-left transition"
              :class="loggingCadence === 'daily'
                ? 'border-white bg-slate-800'
                : 'border-slate-700 bg-slate-800/50'"
              @click="saveLoggingCadence('daily')"
            >
              <span class="block font-bold text-white">Every day</span>
              <span class="mt-1 block text-sm leading-6 text-slate-400">Best when you want details while they are fresh.</span>
            </button>
          </div>

          <div v-if="loggingCadence === 'weekly'" class="mt-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Preferred log day</p>
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="option in weeklyLogDayOptions"
                :key="option.value"
                type="button"
                class="rounded-full px-3 py-2 text-sm font-bold transition"
                :class="weeklyLogDay === option.value
                  ? 'bg-white text-slate-950'
                  : 'bg-slate-800 text-slate-300 ring-1 ring-slate-700'"
                @click="saveWeeklyLogDay(option.value)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </section>

        <section id="settings-reminders" class="scroll-mt-3 rounded-4xl border border-slate-800 bg-slate-900 p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Reminders</p>
          <h2 class="mt-1 text-xl font-bold text-white">Logging notifications</h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            {{ logReminderScheduleDescription }}
          </p>
          <p class="mt-2 text-xs leading-5 text-slate-500">
            Device permission: {{ logReminderDevicePermissionLabel }}. Turning VCH reminders off stops app reminders but does not change your device notification permission.
          </p>

          <p v-if="logReminderPermissionState === 'unsupported'" class="mt-3 text-sm leading-6 text-amber-200">
            Notifications are not supported in this browser.
          </p>
          <p v-else-if="logReminderPermissionState === 'denied'" class="mt-3 text-sm leading-6 text-amber-200">
            Notifications are blocked for this app. Enable them in your phone or browser settings, then come back and tap Enable.
          </p>
          <p v-else-if="pushBackendConfigured === false" class="mt-3 text-sm leading-6 text-amber-200">
            Background push is not configured on the server yet (missing VAPID keys in Netlify). Reminders cannot reach this device until that is fixed.
          </p>
          <p v-else-if="hasRegisteredPushSubscription === false" class="mt-3 text-sm leading-6 text-amber-200">
            This device is not registered for push reminders yet. Tap Enable after notifications are allowed.
          </p>

          <div class="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-slate-700 bg-slate-800/50 px-4 py-4">
            <div>
              <p class="font-bold text-white">Log reminders</p>
              <p class="mt-1 text-sm text-slate-400">
                {{ logReminderStatusLabel }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-full px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
              :class="remindersEnabled
                ? 'bg-white text-slate-950'
                : 'bg-slate-700 text-slate-200 ring-1 ring-slate-600'"
              :disabled="isReminderTogglePending"
              @click="toggleLogReminders"
            >
              {{ isReminderTogglePending ? 'Working...' : logReminderButtonLabel }}
            </button>
          </div>

          <div class="mt-4 rounded-3xl border border-slate-700 bg-slate-800/50 px-4 py-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Reminder schedule
            </p>
            <p class="mt-2 text-sm leading-6 text-slate-300">
              {{ logReminderScheduleDescription }}
            </p>
            <p class="mt-2 text-xs leading-5 text-slate-500">
              Uses your local timezone: {{ logReminderTimezoneLabel }} ({{ reminderTimezone }}).
            </p>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3 rounded-3xl border border-slate-700 bg-slate-800/50 px-4 py-4">
            <div class="min-w-0">
              <p class="font-bold text-white">Test notification</p>
              <p class="mt-1 text-sm text-slate-400">
                Sends a real OS notification now so you can confirm this device is set up.
              </p>
            </div>
            <button
              type="button"
              class="shrink-0 rounded-full bg-slate-700 px-4 py-2 text-sm font-bold text-slate-200 ring-1 ring-slate-600 transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="isReminderTogglePending || isSendingTestReminder"
              @click="sendTestLogReminder"
            >
              {{ isSendingTestReminder ? 'Sending...' : 'Send test' }}
            </button>
          </div>

          <p class="mt-3 text-xs leading-5 text-slate-500">
            Install the app for background alerts when the app is closed. Reminders repeat every hour until you log (daily) or until you log for the week (weekly). On Android, set this app’s notification channel to Sound and pop-up if alerts only appear in the shade. Chrome’s separate “copy URL” system notice is not a VCH reminder.
          </p>
        </section>

        <section id="settings-display" class="scroll-mt-3 rounded-4xl border border-slate-800 bg-slate-900 p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Display</p>
          <h2 class="mt-1 text-xl font-bold text-white">Tracker layout</h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            Auto hides arrow controls on small screens. Choose desktop to keep arrows and the wide layout on a tablet or narrow window.
          </p>

          <div class="mt-4 grid gap-3">
            <button
              v-for="option in layoutOptions"
              :key="option.value"
              type="button"
              class="rounded-3xl border px-4 py-4 text-left transition"
              :class="layoutMode === option.value
                ? 'border-white bg-slate-800'
                : 'border-slate-700 bg-slate-800/50'"
              @click="chooseLayoutMode(option.value)"
            >
              <span class="block font-bold text-white">{{ option.label }}</span>
              <span class="mt-1 block text-sm leading-6 text-slate-400">{{ option.copy }}</span>
            </button>
          </div>
        </section>

        <div id="settings-supporters" class="scroll-mt-3 space-y-5">
        <section class="rounded-4xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Family, friends, other</p>
            <h2 class="mt-1 text-xl font-bold text-white">Family reporting access</h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">
              Create a private link for someone you trust. They enter their own contact info on each report. You can also create a link from a saved entry in your history.
            </p>
          </div>

          <div
            v-if="!canUseFamilyReporting"
            class="mt-4 rounded-3xl border border-amber-900/50 bg-amber-950/20 p-4"
          >
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-lock" class="mt-0.5 size-5 shrink-0 text-amber-300" />
              <div>
                <p class="font-semibold text-amber-100">Pro feature</p>
                <p class="mt-1 text-sm leading-6 text-amber-50/90">
                  Family reporting links are included with Pro so family, friends, or others can submit signed observations for your claim.
                </p>
                <NuxtLink
                  to="/upgrade"
                  class="mt-3 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-4 py-3 text-sm font-bold text-slate-950"
                >
                  Unlock family reporting
                </NuxtLink>
                <a
                  :href="supportEmailHref"
                  class="mt-3 block text-xs font-semibold text-amber-100/80 underline-offset-2 hover:underline"
                >
                  Can't pay? Email us for free access
                </a>
              </div>
            </div>
          </div>

          <template v-else>

          <div v-if="linkedEntryContext" class="mt-4 rounded-3xl border border-sky-900/60 bg-sky-950/30 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-sky-300">Linked entry</p>
            <p class="mt-2 font-semibold text-white">{{ linkedEntryContext.summary }}</p>
            <p class="mt-1 text-xs text-sky-200/80">{{ linkedEntryContext.condition }}</p>
          </div>

          <div class="mt-5 space-y-4">
            <label class="block">
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Link label (optional)</span>
              <input
                v-model="supporterForm.link_label"
                type="text"
                class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
                placeholder="Example: Mom, spouse, caregiver"
              >
              <p class="mt-2 px-1 text-xs leading-5 text-slate-400">
                This label is only for you to recognize the link. They enter their real info when submitting a report.
              </p>
            </label>

            <div>
              <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Visible conditions</span>
              <USelectMenu
                v-model="supporterForm.visible_conditions"
                :items="conditionOptions"
                multiple
                placeholder="Choose visible conditions"
                class="w-full"
                color="neutral"
                size="xl"
              />
            </div>

            <button
              type="button"
              class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"
              :disabled="isCreatingSupporter"
              @click="createSupporter"
            >
              {{ isCreatingSupporter ? 'Creating...' : 'Create Private Link' }}
            </button>
          </div>

          <div v-if="createdLink" class="mt-4 rounded-3xl border border-emerald-900 bg-emerald-950/40 p-4">
            <p class="text-sm font-bold text-emerald-200">Private link created</p>
            <p class="mt-2 break-all text-sm leading-6 text-emerald-100">{{ createdLink }}</p>
            <p class="mt-2 text-xs leading-5 text-emerald-200/80">
              Save this now. For privacy, the raw token is only shown when the link is created.
            </p>
            <button
              type="button"
              class="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
              @click="copyCreatedLink"
            >
              <UIcon :name="createdLinkCopied ? 'i-lucide-check' : 'i-lucide-copy'" class="size-4" />
              {{ createdLinkCopied ? 'Copied to clipboard' : 'Copy link' }}
            </button>
          </div>
          </template>
        </section>

        <section class="space-y-3">
          <h2 class="px-1 text-xl font-bold text-white">Existing reporting links</h2>

          <div v-if="!supporterProfiles.length" class="rounded-4xl border border-slate-800 bg-slate-900 p-5 text-center text-sm text-slate-400">
            No reporting links yet.
          </div>

          <article
            v-for="profile in supporterProfiles"
            :key="profile.id"
            class="rounded-4xl border border-slate-800 bg-slate-900 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-bold text-white">{{ profile.display_name || 'Private reporting link' }}</h3>
                <p class="mt-1 text-sm text-slate-400">Reporter details are collected on each submission.</p>
              </div>
              <UBadge :color="profile.active ? 'success' : 'neutral'" variant="soft">
                {{ profile.active ? 'Active' : 'Disabled' }}
              </UBadge>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <UBadge
                v-for="condition in profile.visible_conditions"
                :key="condition"
                color="neutral"
                variant="soft"
              >
                {{ condition }}
              </UBadge>
            </div>

            <div v-if="profile.entry_context_summary" class="mt-3 rounded-2xl border border-sky-900/50 bg-sky-950/20 px-3 py-2">
              <p class="text-xs font-bold uppercase tracking-[0.12em] text-sky-300">Linked entry</p>
              <p class="mt-1 text-sm text-sky-100">{{ profile.entry_context_summary }}</p>
            </div>

            <div class="mt-4 flex items-center gap-3">
              <button
                type="button"
                class="grid size-11 shrink-0 place-items-center rounded-full bg-slate-800 text-white ring-1 ring-slate-700 transition hover:bg-slate-700"
                :disabled="isCopyingSupporterId === profile.id"
                :aria-label="`Copy link for ${profile.display_name || 'private reporting link'}`"
                @click="copyExistingSupporterLink(profile)"
              >
                <UIcon
                  :name="copiedSupporterId === profile.id ? 'i-lucide-check' : 'i-lucide-copy'"
                  class="size-4"
                />
                <span class="sr-only">{{ copiedSupporterId === profile.id ? 'Copied' : 'Copy link' }}</span>
              </button>
              <button
                type="button"
                class="flex-1 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700"
                @click="toggleSupporter(profile)"
              >
                {{ profile.active ? 'Disable link' : 'Reactivate link' }}
              </button>
              <button
                type="button"
                class="flex-1 rounded-2xl bg-red-950/50 px-4 py-3 text-sm font-bold text-red-300 ring-1 ring-red-900/60"
                @click="requestDeleteSupporter(profile)"
              >
                Delete link
              </button>
            </div>
          </article>
        </section>
        </div>

        <section id="settings-passkeys" class="scroll-mt-3 rounded-4xl border border-slate-800 bg-slate-900 p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sign-in &amp; security</p>
          <h2 class="mt-1 text-xl font-bold text-white">Passkeys</h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            Sign in with your fingerprint, face, or device PIN instead of a password. Passkeys stay on your device and cannot be phished.
          </p>

          <p v-if="!isPasskeySupported" class="mt-3 text-sm leading-6 text-amber-200">
            This browser does not support passkeys. Try a modern browser on your phone or computer.
          </p>

          <template v-else>
            <p v-if="passkeysError" class="mt-3 text-sm font-medium text-red-300">{{ passkeysError }}</p>
            <p v-if="passkeyActionError" class="mt-3 text-sm font-medium text-red-300">{{ passkeyActionError }}</p>

            <div v-if="isLoadingPasskeys && !passkeys.length" class="mt-4 space-y-2">
              <div class="h-16 animate-pulse rounded-3xl bg-slate-800/70" />
            </div>

            <div v-else-if="passkeys.length" class="mt-4 space-y-2">
              <div
                v-for="passkey in passkeys"
                :key="passkey.id"
                class="rounded-3xl border border-slate-700 bg-slate-800/50 px-4 py-4"
              >
                <div class="flex items-center justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <UIcon name="i-lucide-fingerprint" class="size-5 shrink-0 text-sky-300" />
                    <div class="min-w-0">
                      <template v-if="renamingPasskeyId === passkey.id">
                        <input
                          v-model="renamePasskeyName"
                          type="text"
                          maxlength="120"
                          class="w-full rounded-2xl border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-slate-400"
                          placeholder="Name this passkey (e.g. My phone)"
                          @keydown.enter.prevent="saveRenamePasskey"
                          @keydown.esc="cancelRenamePasskey"
                        >
                      </template>
                      <template v-else>
                        <p class="truncate font-bold text-white">{{ passkey.friendly_name || 'Passkey' }}</p>
                        <p class="mt-0.5 text-xs text-slate-400">
                          Added {{ formatPasskeyDate(passkey.created_at) }}<template v-if="passkey.last_used_at"> · Last used {{ formatPasskeyDate(passkey.last_used_at) }}</template>
                        </p>
                      </template>
                    </div>
                  </div>

                  <div class="flex shrink-0 items-center gap-1">
                    <template v-if="renamingPasskeyId === passkey.id">
                      <button
                        type="button"
                        class="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-950 disabled:opacity-60"
                        :disabled="isPasskeyBusy"
                        @click="saveRenamePasskey"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        class="rounded-full bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200"
                        :disabled="isPasskeyBusy"
                        @click="cancelRenamePasskey"
                      >
                        Cancel
                      </button>
                    </template>
                    <template v-else>
                      <button
                        type="button"
                        class="rounded-full p-2 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                        aria-label="Rename passkey"
                        @click="startRenamePasskey(passkey)"
                      >
                        <UIcon name="i-lucide-pencil" class="size-4" />
                      </button>
                      <button
                        type="button"
                        class="rounded-full p-2 text-slate-400 transition hover:bg-red-950 hover:text-red-300"
                        aria-label="Delete passkey"
                        @click="requestDeletePasskey(passkey)"
                      >
                        <UIcon name="i-lucide-trash-2" class="size-4" />
                      </button>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <p v-else class="mt-4 text-sm leading-6 text-slate-500">
              No passkeys yet. Add one to sign in without your password next time.
            </p>

            <button
              type="button"
              class="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200 disabled:opacity-60"
              :disabled="isAddingPasskey || isPasskeyBusy"
              @click="handleAddPasskey"
            >
              <UIcon name="i-lucide-plus" class="size-4" />
              {{ isAddingPasskey ? 'Waiting for your device...' : 'Add a passkey' }}
            </button>
          </template>
        </section>

        <section id="settings-sessions" class="scroll-mt-3 rounded-4xl border border-red-900/40 bg-slate-900 p-5">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/80">Sign-in &amp; security</p>
          <h2 class="mt-1 text-xl font-bold text-white">Sessions</h2>
          <p class="mt-2 text-sm leading-6 text-slate-400">
            Signed in on a shared or borrowed computer? Use <span class="font-semibold text-slate-300">Sign out everywhere</span> so no one else can open your logs. You can sign back in anytime with your passkey, Google, or email.
          </p>

          <div class="mt-4 rounded-3xl border border-slate-700 bg-slate-800/50 px-4 py-4">
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-monitor-smartphone" class="mt-0.5 size-5 shrink-0 text-sky-300" />
              <div class="min-w-0">
                <p class="font-bold text-white">Signed in in this browser</p>
                <p class="mt-1 text-xs text-slate-500">
                  Other browsers or computers you used are not listed here yet.
                </p>
                <p v-if="sessionSignInMethodLabel" class="mt-1 text-sm text-slate-400">
                  {{ sessionSignInMethodLabel }}
                </p>
                <p v-if="sessionLastSignInLabel" class="mt-1 text-xs text-slate-500">
                  {{ sessionLastSignInLabel }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700 transition hover:bg-slate-700 disabled:opacity-60"
              :disabled="Boolean(pendingSessionAction)"
              @click="handleSignOut"
            >
              {{ pendingSessionAction === 'local' ? 'Signing out...' : 'Sign out in this browser' }}
            </button>
            <button
              type="button"
              class="rounded-2xl bg-red-950/40 px-4 py-3 text-sm font-bold text-red-200 ring-1 ring-red-900/60 transition hover:bg-red-950/60 disabled:opacity-60"
              :disabled="Boolean(pendingSessionAction)"
              @click="handleSignOutEverywhere"
            >
              {{ pendingSessionAction === 'everywhere' ? 'Signing out...' : 'Sign out everywhere' }}
            </button>
          </div>
        </section>

        <section id="settings-recovery" class="scroll-mt-3 rounded-4xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Deleted Entries</p>
            <h2 class="mt-1 text-xl font-bold text-white">Recovery bin</h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">
              Entries removed from your log stay here until you restore or permanently remove them.
            </p>
          </div>

          <div v-if="!deletedHistoryEntries.length" class="mt-5 rounded-3xl border border-slate-800 bg-slate-950/60 p-5 text-center text-sm text-slate-400">
            No deleted entries.
          </div>

          <div v-else class="mt-5 space-y-3">
            <article
              v-for="entry in deletedHistoryEntries"
              :key="entry.id"
              class="rounded-3xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <UBadge color="neutral" variant="soft" size="sm">{{ entry.condition }}</UBadge>
                    <UBadge color="error" variant="soft" size="sm">Deleted</UBadge>
                  </div>
                  <h3 class="mt-2 font-bold text-white">{{ entry.title }}</h3>
                  <p class="mt-1 text-xs text-slate-400">{{ entry.deletedLabel }}</p>
                </div>

                <div class="flex shrink-0 flex-col gap-2">
                  <button
                    type="button"
                    class="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-950"
                    :disabled="isRestoringEntryId === entry.id"
                    @click="restoreDeletedEntry(entry.id)"
                  >
                    {{ isRestoringEntryId === entry.id ? 'Restoring...' : 'Restore' }}
                  </button>
                  <button
                    type="button"
                    class="rounded-full px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-950/40"
                    @click="requestPurgeDeletedEntry(entry.id)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section id="settings-danger" class="scroll-mt-3 rounded-4xl border border-red-900/40 bg-slate-900 p-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-red-300/80">Data control</p>
            <h2 class="mt-1 text-xl font-bold text-white">Delete all logs</h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">
              Permanently remove every symptom entry from your account, including items in your recovery bin. Your profile, plan, and condition picks stay saved.
            </p>
            <p v-if="activeLogCount > 0" class="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {{ activeLogCount }} {{ activeLogCount === 1 ? 'entry' : 'entries' }} saved
            </p>
            <p v-else class="mt-3 text-xs leading-5 text-slate-500">
              No logs saved right now. You can still use this setting anytime you need a fresh start.
            </p>
          </div>

          <button
            type="button"
            class="mt-5 w-full rounded-2xl bg-red-950/50 px-4 py-3 text-sm font-bold text-red-300 ring-1 ring-red-900/60 transition hover:bg-red-950/70"
            @click="openDeleteAllLogsModal"
          >
            Delete all logs
          </button>
        </section>

        <p v-if="pageError" class="rounded-3xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm font-medium text-red-200">
          {{ pageError }}
        </p>
        </div>
        </div>
      </div>
    </section>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="pendingPurgeEntry"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
        @click.self="cancelPurgeDeletedEntry"
      >
        <div class="w-full max-w-md rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Permanent removal</p>
          <h3 class="mt-2 text-xl font-bold text-white">Remove forever?</h3>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            <span class="font-semibold text-white">{{ pendingPurgeEntry.title }}</span>
            will be removed from your deleted archive. This cannot be undone.
          </p>

          <div class="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white"
              @click="cancelPurgeDeletedEntry"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white"
              @click="confirmPurgeDeletedEntry"
            >
              Remove forever
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
        v-if="pendingDeleteSupporter"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
        @click.self="cancelDeleteSupporter"
      >
        <div class="w-full max-w-md rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Delete reporting link</p>
          <h3 class="mt-2 text-xl font-bold text-white">Remove this link forever?</h3>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            <span class="font-semibold text-white">{{ pendingDeleteSupporter.display_name }}</span>
            will stop working immediately. Anyone with the old URL will no longer be able to submit reports.
          </p>

          <div class="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white"
              @click="cancelDeleteSupporter"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white"
              :disabled="isDeletingSupporterId === pendingDeleteSupporter.id"
              @click="confirmDeleteSupporter"
            >
              {{ isDeletingSupporterId === pendingDeleteSupporter.id ? 'Deleting...' : 'Delete link' }}
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
        v-if="isDeleteAllLogsModalOpen"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
        @click.self="closeDeleteAllLogsModal"
      >
        <form
          class="w-full max-w-md rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 shadow-2xl"
          @submit.prevent="confirmDeleteAllLogs"
        >
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-red-300/80">Delete all logs</p>
          <h3 class="mt-2 text-xl font-bold text-white">Remove every entry?</h3>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            This permanently deletes all symptom logs and clears your recovery bin. It cannot be undone.
          </p>

          <label v-if="usesPasswordLogin" class="mt-5 block">
            <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Password</span>
            <PasswordInput
              v-model="deleteAllLogsPassword"
              tone="dark"
              autocomplete="current-password"
              placeholder="Enter your account password"
              required
            />
          </label>

          <label v-else class="mt-5 block">
            <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Confirmation</span>
            <input
              v-model="deleteAllLogsConfirmPhrase"
              type="text"
              autocomplete="off"
              class="w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 px-4 py-4 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400"
              placeholder="Type DELETE ALL LOGS"
              required
            >
            <p class="mt-2 px-1 text-xs leading-5 text-slate-400">
              Google sign-in accounts must type <span class="font-semibold text-slate-300">DELETE ALL LOGS</span> to confirm.
            </p>
          </label>

          <p v-if="deleteAllLogsError" class="mt-3 text-sm font-medium text-red-300">{{ deleteAllLogsError }}</p>

          <div class="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white"
              :disabled="isDeletingAllLogs"
              @click="closeDeleteAllLogsModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              :disabled="isDeletingAllLogs"
            >
              {{ isDeletingAllLogs ? 'Deleting...' : 'Delete all logs' }}
            </button>
          </div>
        </form>
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
        v-if="pendingDeletePasskey"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
        @click.self="cancelDeletePasskey"
      >
        <div class="w-full max-w-md rounded-[1.75rem] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Delete passkey</p>
          <h3 class="mt-2 text-xl font-bold text-white">Remove this passkey?</h3>
          <p class="mt-3 text-sm leading-6 text-slate-300">
            <span class="font-semibold text-white">{{ pendingDeletePasskey.friendly_name || 'This passkey' }}</span>
            will stop working for sign-in immediately. You can still sign in with your other methods, and you can add a new passkey any time.
          </p>

          <p v-if="deletePasskeyError" class="mt-3 text-sm font-medium text-red-300">{{ deletePasskeyError }}</p>

          <div class="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white"
              :disabled="isDeletingPasskey"
              @click="cancelDeletePasskey"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-2xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              :disabled="isDeletingPasskey"
              @click="confirmDeletePasskey"
            >
              {{ isDeletingPasskey ? 'Deleting...' : 'Delete passkey' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <ContactSupportOverlay
      :open="isContactSupportOpen"
      :default-name="profileForm.full_name"
      :default-email="user?.email || ''"
      @close="isContactSupportOpen = false"
    />

    <FaqOverlay
      :open="isFaqOverlayOpen"
      @close="isFaqOverlayOpen = false"
      @open-contact="openContactFromFaq"
    />
  </main>
</template>

<script setup lang="ts">
import { useTimedPasswordReveal } from '../composables/useTimedPasswordReveal'
import { useSupabaseAuth } from '../composables/useSupabaseAuth'
import { usePasskeys, type TrackerPasskey } from '../composables/usePasskeys'
import { useUserProfiles } from '../composables/useUserProfiles'
import { useSymptomEntries } from '../composables/useSymptomEntries'
import { useDeletedEntryArchive } from '../composables/useDeletedEntryArchive'
import { useEntitlements } from '../composables/useEntitlements'
import { useAppWelcome } from '../composables/useAppWelcome'
import {
  FREE_CONDITION_LIMIT,
  formatConditionKeyLabel,
  PRO_ANNUAL_PRICE_LABEL,
  buildSupportEmailHref
} from '../utils/subscription'
import { WEEKLY_LOG_DAY_OPTIONS, type LoggingCadence } from '../utils/loggingCadence'
import {
  describeLogReminderSchedule,
  formatTimezoneLabel,
  LOG_REMINDER_HOUR_OPTIONS
} from '../utils/logReminders'
import { useTrackerLayout, TRACKER_CLOSE_EMBED_PROFILE_KEY, type TrackerLayoutMode } from '../composables/useTrackerLayout'
import type { SettingsSection } from '../composables/useSettingsSectionNav'
import { mapEntryHistoryItem } from '../utils/entryDisplay'
import { copyToClipboard } from '../utils/copyToClipboard'
import { AUTH_NOTICES, authNoticeToast, authSuccessToast, handleAuthApiFailure, resolveAuthApiErrorMessage, validateSignupForm, AUTH_VALIDATION, authErrorToast, isEmailConfirmationNotice } from '../utils/authNotices'
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const closeEmbedProfile = inject<(() => void) | null>(TRACKER_CLOSE_EMBED_PROFILE_KEY, null)
const settingsScrollEl = ref<HTMLElement | null>(null)

const settingsSections: SettingsSection[] = [
  { id: 'settings-account', label: 'Account' },
  { id: 'settings-logging', label: 'Logging' },
  { id: 'settings-reminders', label: 'Reminders' },
  { id: 'settings-display', label: 'Display' },
  { id: 'settings-supporters', label: 'Family, friends, other' },
  { id: 'settings-passkeys', label: 'Passkeys' },
  { id: 'settings-sessions', label: 'Sessions' },
  { id: 'settings-recovery', label: 'Recovery' },
  { id: 'settings-danger', label: 'Delete logs' }
]

const {
  user,
  isAuthLoading,
  authError,
  signIn,
  signUp,
  resendConfirmationEmail,
  signInWithGoogle,
  sendPasswordReset,
  signOut,
  signOutEverywhere,
  verifyPassword
} = useSupabaseAuth()
const {
  passkeys,
  isLoadingPasskeys,
  passkeysError,
  isPasskeyBusy,
  isPasskeySupported,
  signInWithPasskey,
  registerPasskey,
  loadPasskeys,
  renamePasskey,
  deletePasskey,
  clearPasskeys
} = usePasskeys()
const {
  getProfile,
  upsertProfile,
  listSupporterProfiles,
  createSupporterProfile,
  createSupporterProfileLink,
  toggleSupporterProfile,
  deleteSupporterProfile
} = useUserProfiles()
const { showSubmissionToast } = useSubmissionToast()
const { createEntry, listEntries, deleteAllEntries } = useSymptomEntries()
const {
  listDeletedEntries,
  removeDeletedEntry,
  takeDeletedEntry,
  archiveDeletedEntry,
  clearDeletedEntriesForUser
} = useDeletedEntryArchive()
const {
  isPro,
  isComped,
  freeConditionKeys,
  canUseFamilyReporting,
  canTrackCondition,
  renewalLabel,
  entitlementsLoaded,
  loadEntitlements
} = useEntitlements()
const {
  loggingCadence,
  weeklyLogDay,
  needsAppWelcome,
  loadAppWelcomeState,
  updateLoggingCadence
} = useAppWelcome()
const {
  remindersEnabled,
  reminderHour,
  reminderEveningHour,
  reminderTimezone,
  permissionState: logReminderPermissionState,
  pushBackendConfigured,
  hasRegisteredPushSubscription,
  isReminderTogglePending,
  refreshPushReminderStatus,
  enableRemindersWithPermission,
  disableReminders,
  hydrateReminderSettings,
  updateReminderHour,
  sendTestReminderNotification,
  syncPermissionState
} = useLogReminders()
const logReminderHourOptions = LOG_REMINDER_HOUR_OPTIONS
const isSendingTestReminder = ref(false)

const logReminderScheduleDescription = computed(() => {
  return describeLogReminderSchedule(
    loggingCadence.value,
    weeklyLogDay.value,
    reminderHour.value,
    reminderTimezone.value,
    reminderEveningHour.value
  )
})

const logReminderTimezoneLabel = computed(() => formatTimezoneLabel(reminderTimezone.value))
const logReminderStatusLabel = computed(() => {
  if (logReminderPermissionState.value === 'denied') {
    return 'Blocked in device settings'
  }

  if (logReminderPermissionState.value === 'unsupported') {
    return 'Not supported on this browser'
  }

  if (pushBackendConfigured.value === false) {
    return 'Server setup needed'
  }

  if (hasRegisteredPushSubscription.value === false) {
    return 'Needs setup on this device'
  }

  if (logReminderPermissionState.value === 'granted' && !remindersEnabled.value) {
    return 'Device allowed; VCH reminders off'
  }

  return remindersEnabled.value ? 'On for this device' : 'Off'
})
const logReminderButtonLabel = computed(() => {
  if (remindersEnabled.value && hasRegisteredPushSubscription.value) {
    return 'On'
  }

  if (logReminderPermissionState.value === 'denied') {
    return 'Blocked'
  }

  return 'Enable'
})
const logReminderDevicePermissionLabel = computed(() => {
  if (logReminderPermissionState.value === 'granted') {
    return 'Allowed'
  }

  if (logReminderPermissionState.value === 'denied') {
    return 'Blocked in device settings'
  }

  if (logReminderPermissionState.value === 'unsupported') {
    return 'Not supported here'
  }

  return 'Not decided yet'
})
const { layoutMode, setLayoutMode } = useTrackerLayout()

const layoutOptions: Array<{ value: TrackerLayoutMode, label: string, copy: string }> = [
  {
    value: 'auto',
    label: 'Auto',
    copy: 'Use mobile layout on small screens and desktop arrows on wider screens.'
  },
  {
    value: 'desktop',
    label: 'Desktop',
    copy: 'Always show arrow controls and the wider carousel layout.'
  },
  {
    value: 'mobile',
    label: 'Mobile',
    copy: 'Always use the compact phone layout, even on a large screen.'
  }
]

const weeklyLogDayOptions = WEEKLY_LOG_DAY_OPTIONS

const supportEmailHref = buildSupportEmailHref()

const freeConditionKeyLabels = computed(() => {
  return freeConditionKeys.value.map((key) => formatConditionKeyLabel(key))
})

const conditionOptions = [
  'PTSD / Mental Health',
  'Back or Joint Pain',
  'Nerve / Radiculopathy',
  'Migraine / Headache',
  'IBS / Bowel Symptoms',
  'GERD / Acid Reflux',
  'Sleep Issues'
]

const authMode = ref<'login' | 'signup'>('login')
const authName = ref('')
const authEmail = ref('')
const {
  isEmailCooldownActive,
  resendConfirmationLabel,
  forgotPasswordLabel,
  refreshCooldown
} = useAuthEmailCooldown(authEmail)
const authPassword = ref('')
const authConfirmPassword = ref('')
const signupPasswordReveal = useTimedPasswordReveal()
const authValidationMessage = ref('')
const needsEmailConfirmation = ref(false)
const isAuthSubmitting = ref(false)

watch(authMode, () => {
  signupPasswordReveal.hide()
  authConfirmPassword.value = ''
  authValidationMessage.value = ''
})

// Cached across visits so the page renders instantly with the last known
// data instead of flashing empty sections on every navigation.
const profileForm = useState('profile-page-form', () => ({
  full_name: ''
}))
const supporterForm = ref({
  link_label: '',
  visible_conditions: [] as string[]
})
const supporterProfiles = useState<any[]>('profile-page-supporters', () => [])
const deletedEntries = ref<any[]>([])
const createdLink = ref('')
const createdLinkCopied = ref(false)
const linkedEntryId = ref<string | null>(null)
const linkedEntryContext = ref<null | { summary: string, condition: string }>(null)
const pageError = ref('')
const isSavingProfile = ref(false)
const profileInitialized = useState('profile-page-initialized', () => false)
const isHydratingProfile = ref(false)
const autoSaveState = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')
const autoSaveLabel = computed(() => {
  if (autoSaveState.value === 'saving') {
    return 'Saving...'
  }

  if (autoSaveState.value === 'saved') {
    return 'Saved'
  }

  if (autoSaveState.value === 'error') {
    return 'Save failed'
  }

  return ''
})

let profileSaveTimer: ReturnType<typeof setTimeout> | undefined
let savedLabelTimer: ReturnType<typeof setTimeout> | undefined
const isCreatingSupporter = ref(false)
const isRestoringEntryId = ref<string | null>(null)
const isDeletingSupporterId = ref<string | null>(null)
const isCopyingSupporterId = ref<string | null>(null)
const copiedSupporterId = ref<string | null>(null)
const pendingPurgeEntry = ref<null | { id: string, title: string }>(null)
const pendingDeleteSupporter = ref<null | { id: string, display_name: string }>(null)
const activeLogCount = useState('profile-page-log-count', () => 0)
const isContactSupportOpen = ref(false)
const isFaqOverlayOpen = ref(false)
const isDeleteAllLogsModalOpen = ref(false)
const deleteAllLogsPassword = ref('')
const deleteAllLogsConfirmPhrase = ref('')
const deleteAllLogsError = ref('')
const isDeletingAllLogs = ref(false)

const usesPasswordLogin = computed(() => {
  return Boolean(user.value?.identities?.some((identity) => identity.provider === 'email'))
})

const usesGoogleLogin = computed(() => {
  return Boolean(user.value?.identities?.some((identity) => identity.provider === 'google'))
})

const signInMethodLabel = computed(() => {
  const providers = new Set(user.value?.identities?.map((identity) => identity.provider) ?? [])
  const methods: string[] = []

  if (providers.has('google')) {
    methods.push('Google')
  }

  if (providers.has('webauthn')) {
    methods.push('passkey')
  }

  if (providers.has('email')) {
    methods.push('email & password')
  }

  if (!methods.length) {
    return ''
  }

  return `Signed in with ${methods.join(' and ')}`
})

const sessionSignInMethodLabel = computed(() => {
  if (signInMethodLabel.value) {
    return signInMethodLabel.value
  }

  if (passkeys.value.length) {
    return 'Passkey available on this account'
  }

  return 'Sign-in method unavailable'
})

const sessionLastSignInLabel = computed(() => {
  const lastSignInAt = user.value?.last_sign_in_at

  if (!lastSignInAt) {
    return ''
  }

  const parsed = new Date(lastSignInAt)

  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  return `Last signed in ${parsed.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })}`
})

const pendingSessionAction = ref<'local' | 'everywhere' | null>(null)

const deletedHistoryEntries = computed(() => {
  return deletedEntries.value.map((entry) => mapEntryHistoryItem(entry, { deleted: true }))
})

onMounted(() => {
  syncPermissionState()
  applySupporterLinkQuery()
  if (user.value) {
    loadProfilePage()
  }
})

function applySupporterLinkQuery() {
  const entryId = typeof route.query.entry === 'string' ? route.query.entry : null
  const condition = typeof route.query.condition === 'string' ? route.query.condition : null
  const label = typeof route.query.label === 'string' ? route.query.label : null
  const summary = typeof route.query.summary === 'string' ? route.query.summary : null

  linkedEntryId.value = entryId

  if (condition) {
    supporterForm.value.visible_conditions = [condition]
  }

  if (label) {
    supporterForm.value.link_label = label
  }

  if (summary && condition) {
    linkedEntryContext.value = {
      summary,
      condition
    }
  }
}

watch(user, (currentUser) => {
  if (currentUser) {
    loadProfilePage()
  } else {
    deletedEntries.value = []
    supporterProfiles.value = []
    profileForm.value.full_name = ''
    activeLogCount.value = 0
    profileInitialized.value = false
    clearPasskeys()
  }
})

watch(isAuthLoading, (loading) => {
  if (!loading && user.value) {
    loadProfilePage()
  }
})

function loadDeletedEntries() {
  if (!user.value) {
    deletedEntries.value = []
    return
  }

  deletedEntries.value = listDeletedEntries(user.value.id)
}

function chooseLayoutMode(mode: TrackerLayoutMode) {
  setLayoutMode(mode)
  markAutoSaveSaved()
}

async function loadProfilePage() {
  pageError.value = ''
  isHydratingProfile.value = true
  loadDeletedEntries()
  loadPasskeys()

  try {
    const [profile, supporters, entries] = await Promise.all([
      getProfile(),
      listSupporterProfiles(),
      listEntries().catch(() => [])
    ])

    await loadEntitlements()
    await loadAppWelcomeState()

    activeLogCount.value = entries.length
    profileForm.value.full_name = profile?.full_name || user.value?.user_metadata?.full_name || ''
    hydrateReminderSettings(profile)
    supporterProfiles.value = supporters
    await refreshPushReminderStatus()
  } catch (error) {
    pageError.value = getErrorMessage(error)
  } finally {
    profileInitialized.value = true
    isHydratingProfile.value = false
  }
}

function markAutoSavePending() {
  autoSaveState.value = 'saving'
}

function markAutoSaveSaved() {
  autoSaveState.value = 'saved'

  if (savedLabelTimer) {
    clearTimeout(savedLabelTimer)
  }

  savedLabelTimer = setTimeout(() => {
    if (autoSaveState.value === 'saved') {
      autoSaveState.value = 'idle'
    }
  }, 2000)
}

function scheduleProfileAutoSave() {
  if (!user.value || !profileInitialized.value || isHydratingProfile.value) {
    return
  }

  markAutoSavePending()

  if (profileSaveTimer) {
    clearTimeout(profileSaveTimer)
  }

  profileSaveTimer = setTimeout(() => {
    saveProfile()
  }, 650)
}

watch(
  () => profileForm.value.full_name,
  () => {
    scheduleProfileAutoSave()
  }
)

onUnmounted(() => {
  if (profileSaveTimer) {
    clearTimeout(profileSaveTimer)
  }

  if (savedLabelTimer) {
    clearTimeout(savedLabelTimer)
  }
})

async function saveProfile() {
  isSavingProfile.value = true
  pageError.value = ''

  try {
    await upsertProfile({
      full_name: profileForm.value.full_name,
      display_name: profileForm.value.full_name
    })
    markAutoSaveSaved()
  } catch (error) {
    autoSaveState.value = 'error'
    pageError.value = getErrorMessage(error)
  } finally {
    isSavingProfile.value = false
  }
}

async function saveLoggingCadence(cadence: LoggingCadence) {
  pageError.value = ''
  markAutoSavePending()

  try {
    await updateLoggingCadence(cadence, weeklyLogDay.value)
    markAutoSaveSaved()
  } catch (error) {
    autoSaveState.value = 'error'
    pageError.value = getErrorMessage(error)
  }
}

async function saveWeeklyLogDay(day: number) {
  pageError.value = ''
  markAutoSavePending()

  try {
    await updateLoggingCadence('weekly', day)
    markAutoSaveSaved()
  } catch (error) {
    autoSaveState.value = 'error'
    pageError.value = getErrorMessage(error)
  }
}

async function toggleLogReminders() {
  if (isReminderTogglePending.value) {
    return
  }

  if (remindersEnabled.value) {
    await disableReminders()
    await refreshPushReminderStatus()
    showSubmissionToast({ message: 'VCH reminders turned off.' })
    return
  }

  const result = await enableRemindersWithPermission()

  if (result.ok) {
    showSubmissionToast({ message: 'Log reminders turned on for this device.' })
    return
  }

  if (result.reason === 'missing-vapid') {
    showSubmissionToast({
      message: 'Push reminders are not configured on the server yet. Add VAPID keys in Netlify, redeploy, then try again.',
      tone: 'error'
    })
    return
  }

  if (result.reason === 'permission-denied') {
    showSubmissionToast({
      message: 'Notifications are blocked for this app. Enable them in phone or browser settings, then tap Enable again.',
      tone: 'error'
    })
    return
  }

  if (result.reason === 'unsupported') {
    showSubmissionToast({
      message: 'Notifications are not supported in this browser.',
      tone: 'error'
    })
    return
  }

  if (result.reason === 'subscribe-failed') {
    showSubmissionToast({
      message: result.message || 'Could not register this device for push reminders.',
      tone: 'error'
    })
    return
  }

  showSubmissionToast({
    message: 'Allow notifications to turn on reminders.',
    tone: 'error'
  })
}

async function handleReminderHourChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const hour = Number(target.value)

  if (!Number.isFinite(hour)) {
    return
  }

  pageError.value = ''

  try {
    await updateReminderHour(hour)
    showSubmissionToast({ message: `Reminder time set to ${logReminderHourOptions.find((option) => option.value === hour)?.label || 'your chosen time'}.` })
  } catch (error) {
    pageError.value = getErrorMessage(error)
  }
}

async function sendTestLogReminder() {
  if (isSendingTestReminder.value) {
    return
  }

  isSendingTestReminder.value = true

  try {
    const result = await sendTestReminderNotification()

    if (result.ok) {
      showSubmissionToast({
        message: result.via === 'push'
          ? 'Background push test sent. Check your notification shade.'
          : result.message || 'Test notification shown. Check your notification shade.'
      })
      return
    }

    showSubmissionToast({
      message: result.message || 'Could not send a test notification.',
      tone: 'error'
    })
  } finally {
    isSendingTestReminder.value = false
  }
}

async function createSupporter() {
  pageError.value = ''
  createdLink.value = ''

  if (!canUseFamilyReporting.value) {
    pageError.value = 'Family reporting requires Pro. Visit Payment center to upgrade.'
    return
  }

  if (!supporterForm.value.visible_conditions.length) {
    pageError.value = 'Choose at least one visible condition.'
    return
  }

  isCreatingSupporter.value = true

  try {
    const payload = {
      ...supporterForm.value,
      linked_entry_id: linkedEntryId.value,
      entry_context_summary: linkedEntryContext.value?.summary || null
    }
    const { token } = await createSupporterProfile(payload)
    createdLink.value = `${window.location.origin}/report/${token}`
    createdLinkCopied.value = false
    supporterForm.value = {
      link_label: '',
      visible_conditions: []
    }
    linkedEntryId.value = null
    linkedEntryContext.value = null
    await loadProfilePage()
    showSubmissionToast('Reporting link created.')
  } catch (error) {
    pageError.value = getErrorMessage(error)
  } finally {
    isCreatingSupporter.value = false
  }
}

async function toggleSupporter(profile: any) {
  pageError.value = ''

  try {
    await toggleSupporterProfile(profile.id, !profile.active)
    await loadProfilePage()
  } catch (error) {
    pageError.value = getErrorMessage(error)
  }
}

async function copyCreatedLink() {
  if (!createdLink.value) {
    return
  }

  const copied = await copyToClipboard(createdLink.value)
  createdLinkCopied.value = copied
  if (copied) {
    showSubmissionToast('Private link copied.')
  }
  pageError.value = copied ? '' : 'Could not copy link. Copy it manually.'
}

async function copyExistingSupporterLink(profile: any) {
  pageError.value = ''
  copiedSupporterId.value = null
  isCopyingSupporterId.value = profile.id

  try {
    const token = await createSupporterProfileLink(profile.id)
    const link = `${window.location.origin}/report/${token}`
    const copied = await copyToClipboard(link)

    if (copied) {
      copiedSupporterId.value = profile.id
      showSubmissionToast('Private link copied.')
    } else {
      pageError.value = 'Could not copy link. Copy it manually.'
      createdLink.value = link
      createdLinkCopied.value = false
    }
  } catch (error) {
    pageError.value = getErrorMessage(error)
  } finally {
    isCopyingSupporterId.value = null
  }
}

function requestDeleteSupporter(profile: any) {
  pendingDeleteSupporter.value = {
    id: profile.id,
    display_name: profile.display_name || 'Private reporting link'
  }
}

function cancelDeleteSupporter() {
  pendingDeleteSupporter.value = null
}

async function confirmDeleteSupporter() {
  if (!pendingDeleteSupporter.value) {
    return
  }

  pageError.value = ''
  isDeletingSupporterId.value = pendingDeleteSupporter.value.id

  try {
    await deleteSupporterProfile(pendingDeleteSupporter.value.id)
    pendingDeleteSupporter.value = null
    showSubmissionToast('Reporting link deleted.')
    await loadProfilePage()
  } catch (error) {
    pageError.value = getErrorMessage(error)
    showSubmissionToast({
      message: getErrorMessage(error),
      tone: 'error'
    })
  } finally {
    isDeletingSupporterId.value = null
  }
}

async function restoreDeletedEntry(entryId: string) {
  if (!user.value) {
    return
  }

  pageError.value = ''
  isRestoringEntryId.value = entryId

  const archivedEntry = takeDeletedEntry(user.value.id, entryId)
  if (!archivedEntry) {
    isRestoringEntryId.value = null
    return
  }

  try {
    const restoredEntry = { ...archivedEntry }
    delete restoredEntry.deleted_at

    if (!canTrackCondition(restoredEntry.condition_key || 'unknown')) {
      archiveDeletedEntry(user.value.id, archivedEntry)
      loadDeletedEntries()
      pageError.value = `Free plan includes ${FREE_CONDITION_LIMIT} conditions. Upgrade to Pro to restore entries for other conditions.`
      return
    }

    await createEntry({
      condition_key: restoredEntry.condition_key,
      condition_label: restoredEntry.condition_label,
      severity: restoredEntry.severity,
      occurred_at: restoredEntry.occurred_at,
      summary: restoredEntry.summary,
      impact: restoredEntry.impact,
      details: restoredEntry.details || {}
    })

    loadDeletedEntries()
    showSubmissionToast('Entry restored.')
  } catch (error) {
    pageError.value = getErrorMessage(error)
    showSubmissionToast({
      message: getErrorMessage(error),
      tone: 'error'
    })
  } finally {
    isRestoringEntryId.value = null
  }
}

function requestPurgeDeletedEntry(entryId: string) {
  const entry = deletedHistoryEntries.value.find((item) => item.id === entryId)
  if (!entry || !user.value) {
    return
  }

  pendingPurgeEntry.value = {
    id: entryId,
    title: entry.title
  }
}

function cancelPurgeDeletedEntry() {
  pendingPurgeEntry.value = null
}

function confirmPurgeDeletedEntry() {
  if (!pendingPurgeEntry.value || !user.value) {
    return
  }

  removeDeletedEntry(user.value.id, pendingPurgeEntry.value.id)
  pendingPurgeEntry.value = null
  loadDeletedEntries()
  showSubmissionToast('Deleted entry removed permanently.')
}

function openContactFromFaq() {
  isFaqOverlayOpen.value = false
  isContactSupportOpen.value = true
}

function openDeleteAllLogsModal() {
  deleteAllLogsPassword.value = ''
  deleteAllLogsConfirmPhrase.value = ''
  deleteAllLogsError.value = ''
  isDeleteAllLogsModalOpen.value = true
}

function closeDeleteAllLogsModal() {
  if (isDeletingAllLogs.value) {
    return
  }

  isDeleteAllLogsModalOpen.value = false
  deleteAllLogsPassword.value = ''
  deleteAllLogsConfirmPhrase.value = ''
  deleteAllLogsError.value = ''
}

async function confirmDeleteAllLogs() {
  if (!user.value) {
    return
  }

  deleteAllLogsError.value = ''
  isDeletingAllLogs.value = true
  pageError.value = ''

  try {
    if (usesPasswordLogin.value) {
      await verifyPassword(user.value.email || '', deleteAllLogsPassword.value)
    } else if (deleteAllLogsConfirmPhrase.value.trim() !== 'DELETE ALL LOGS') {
      deleteAllLogsError.value = 'Type DELETE ALL LOGS exactly to confirm.'
      return
    }

    await deleteAllEntries()
    clearDeletedEntriesForUser(user.value.id)
    loadDeletedEntries()
    activeLogCount.value = 0
    closeDeleteAllLogsModal()
    showSubmissionToast('All logs deleted.')
  } catch (error) {
    deleteAllLogsError.value = getErrorMessage(error)
    showSubmissionToast({
      message: getErrorMessage(error),
      tone: 'error',
      durationMs: 4200
    })
  } finally {
    isDeletingAllLogs.value = false
  }
}

function redirectAfterAuth() {
  if (closeEmbedProfile) {
    closeEmbedProfile()
    return
  }

  navigateTo('/app')
}

async function handleAuthSubmit() {
  if (isAuthSubmitting.value) {
    return
  }

  authValidationMessage.value = ''
  authError.value = ''

  const validationMessage = validateSignupForm({
    mode: authMode.value,
    name: authName.value,
    email: authEmail.value,
    password: authPassword.value,
    confirmPassword: authConfirmPassword.value
  })

  if (validationMessage) {
    authValidationMessage.value = validationMessage
    return
  }

  isAuthSubmitting.value = true

  try {
    if (authMode.value === 'login') {
      await signIn(authEmail.value, authPassword.value)
      showSubmissionToast(authSuccessToast('Signed in.'))
      redirectAfterAuth()
    } else {
      const data = await signUp(authEmail.value, authPassword.value, authName.value.trim())

      if (data.session || user.value) {
        showSubmissionToast(authSuccessToast('Account created. You are signed in.'))
        redirectAfterAuth()
      } else if (data.needsEmailConfirmation || data.user) {
        needsEmailConfirmation.value = true
        refreshCooldown()
        showSubmissionToast(authNoticeToast(AUTH_NOTICES.signupCheckEmail))
        authMode.value = 'login'
      } else {
        showSubmissionToast(authErrorToast('Signup did not return a user. Check Supabase Auth settings and try again.'))
      }
    }
  } catch {
    handleAuthApiFailure({
      message: resolveAuthApiErrorMessage(authError.value, 'Could not sign in. Check your email and password.'),
      authEmail: authEmail.value,
      setValidationMessage: (message) => {
        authValidationMessage.value = message
      },
      clearAuthError: () => {
        authError.value = ''
      },
      showToast: showSubmissionToast,
      setNeedsEmailConfirmation: (value) => {
        needsEmailConfirmation.value = value
      },
      setAuthModeLogin: () => {
        authMode.value = 'login'
      }
    })
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleResendConfirmation() {
  if (isAuthSubmitting.value) {
    return
  }

  authValidationMessage.value = ''

  if (!authEmail.value.trim()) {
    authValidationMessage.value = AUTH_VALIDATION.enterEmailForResendConfirmation
    return
  }

  isAuthSubmitting.value = true
  authError.value = ''

  try {
    await resendConfirmationEmail(authEmail.value)
    needsEmailConfirmation.value = true
    refreshCooldown()
    showSubmissionToast(authNoticeToast(AUTH_NOTICES.confirmationEmailSent))
  } catch {
    handleAuthApiFailure({
      message: resolveAuthApiErrorMessage(authError.value, 'Could not resend the confirmation email.'),
      authEmail: authEmail.value,
      setValidationMessage: (message) => {
        authValidationMessage.value = message
      },
      clearAuthError: () => {
        authError.value = ''
      },
      showToast: showSubmissionToast
    })
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleForgotPassword() {
  if (isAuthSubmitting.value) {
    return
  }

  authValidationMessage.value = ''
  authError.value = ''

  if (!authEmail.value.trim()) {
    authValidationMessage.value = AUTH_VALIDATION.enterEmailForForgotPassword
    return
  }

  isAuthSubmitting.value = true

  try {
    await sendPasswordReset(authEmail.value)
    refreshCooldown()
    showSubmissionToast(authNoticeToast(AUTH_NOTICES.passwordResetSent))
  } catch {
    handleAuthApiFailure({
      message: resolveAuthApiErrorMessage(authError.value, 'Could not send the reset email.'),
      authEmail: authEmail.value,
      setValidationMessage: (message) => {
        authValidationMessage.value = message
      },
      clearAuthError: () => {
        authError.value = ''
      },
      showToast: showSubmissionToast
    })
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handlePasskeySignIn() {
  isAuthSubmitting.value = true
  authValidationMessage.value = ''
  authError.value = ''

  try {
    await signInWithPasskey()
    showSubmissionToast('Signed in with your passkey.')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not sign in with a passkey.'

    if (isEmailConfirmationNotice(message)) {
      needsEmailConfirmation.value = true
      showSubmissionToast(authNoticeToast(AUTH_NOTICES.emailConfirmationRequired))
      return
    }

    showSubmissionToast(authErrorToast(message))
  } finally {
    isAuthSubmitting.value = false
  }
}

const passkeyActionError = ref('')
const isAddingPasskey = ref(false)
const renamingPasskeyId = ref<string | null>(null)
const renamePasskeyName = ref('')
const pendingDeletePasskey = ref<TrackerPasskey | null>(null)
const deletePasskeyError = ref('')
const isDeletingPasskey = ref(false)

function formatPasskeyDate(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return 'recently'
  }

  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

async function handleAddPasskey() {
  passkeyActionError.value = ''
  isAddingPasskey.value = true

  try {
    await registerPasskey()
    showSubmissionToast('Passkey added. You can use it to sign in next time.')
  } catch (error) {
    passkeyActionError.value = error instanceof Error ? error.message : 'Could not add a passkey.'
  } finally {
    isAddingPasskey.value = false
  }
}

function startRenamePasskey(passkey: TrackerPasskey) {
  passkeyActionError.value = ''
  renamingPasskeyId.value = passkey.id
  renamePasskeyName.value = passkey.friendly_name || ''
}

function cancelRenamePasskey() {
  renamingPasskeyId.value = null
  renamePasskeyName.value = ''
}

async function saveRenamePasskey() {
  if (!renamingPasskeyId.value) {
    return
  }

  passkeyActionError.value = ''

  try {
    await renamePasskey(renamingPasskeyId.value, renamePasskeyName.value)
    cancelRenamePasskey()
  } catch (error) {
    passkeyActionError.value = error instanceof Error ? error.message : 'Could not rename the passkey.'
  }
}

function requestDeletePasskey(passkey: TrackerPasskey) {
  passkeyActionError.value = ''
  deletePasskeyError.value = ''
  pendingDeletePasskey.value = passkey
}

function cancelDeletePasskey() {
  pendingDeletePasskey.value = null
  deletePasskeyError.value = ''
}

async function confirmDeletePasskey() {
  if (!pendingDeletePasskey.value) {
    return
  }

  deletePasskeyError.value = ''
  isDeletingPasskey.value = true

  try {
    await deletePasskey(pendingDeletePasskey.value.id)
    pendingDeletePasskey.value = null
    showSubmissionToast('Passkey deleted.')
  } catch (error) {
    deletePasskeyError.value = error instanceof Error ? error.message : 'Could not delete the passkey.'
    showSubmissionToast({
      message: deletePasskeyError.value,
      tone: 'error'
    })
  } finally {
    isDeletingPasskey.value = false
  }
}

async function handleGoogleSignIn() {
  isAuthSubmitting.value = true
  authValidationMessage.value = ''

  try {
    await signInWithGoogle()
  } catch {
    if (import.meta.client) {
      window.sessionStorage.removeItem('symptom-tracker-auth-success')
    }
    showSubmissionToast(authErrorToast(resolveAuthApiErrorMessage(authError.value, 'Could not sign in with Google.')))
    authError.value = ''
  } finally {
    isAuthSubmitting.value = false
  }
}

const pendingAuthPanelOpen = useState('tracker-pending-auth-panel-open', () => false)

async function handleSignOut() {
  pendingSessionAction.value = 'local'
  pageError.value = ''

  try {
    await signOut()
    authMode.value = 'login'
    authValidationMessage.value = ''

    if (closeEmbedProfile) {
      pendingAuthPanelOpen.value = true
      closeEmbedProfile()
      return
    }

    await navigateTo('/app?login=1')
  } catch {
    pageError.value = authError.value
  } finally {
    pendingSessionAction.value = null
  }
}

async function handleSignOutEverywhere() {
  if (!window.confirm('Sign out on every browser and device? You can sign back in with your passkey, Google, or email.')) {
    return
  }

  pendingSessionAction.value = 'everywhere'
  pageError.value = ''

  try {
    await signOutEverywhere()
    authMode.value = 'login'
    authValidationMessage.value = ''

    if (closeEmbedProfile) {
      pendingAuthPanelOpen.value = true
      closeEmbedProfile()
      return
    }

    await navigateTo('/app?login=1')
  } catch {
    pageError.value = authError.value
  } finally {
    pendingSessionAction.value = null
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
</script>
