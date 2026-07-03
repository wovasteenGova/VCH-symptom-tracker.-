<template>
  <main
    class="flex flex-col bg-slate-950 text-white"
    :class="closeEmbedProfile ? 'h-full min-h-0' : 'min-h-dvh'"
  >
    <section
      class="mx-auto flex w-full max-w-md flex-1 flex-col px-4 pt-4 sm:max-w-lg"
      :class="closeEmbedProfile ? 'min-h-0 overflow-y-auto no-scrollbar' : ''"
    >
      <header class="sticky top-0 z-40 -mx-4 flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950/95 px-4 pb-4 pt-4 backdrop-blur-md">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Account Settings</h1>
        </div>

        <button
          v-if="closeEmbedProfile"
          type="button"
          class="grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
          aria-label="Back to tracker"
          @click="closeEmbedProfile()"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </button>
        <NuxtLink
          v-else
          to="/app"
          class="grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
          aria-label="Back to tracker"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </NuxtLink>
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
            <h2 class="text-xl font-bold text-white">
              {{ authMode === 'login' ? 'Sign in' : 'Create account' }}
            </h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">
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

              <label v-if="authMode === 'signup'" class="block">
                <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Confirm password</span>
                <PasswordInput
                  v-model="authConfirmPassword"
                  name="confirm-password"
                  autocomplete="new-password"
                  tone="dark"
                  placeholder="Re-enter password"
                  :required="authMode === 'signup'"
                />
              </label>

              <label class="block">
                <span class="mb-2 block px-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Password</span>
                <PasswordInput
                  v-model="authPassword"
                  name="password"
                  tone="dark"
                  :autocomplete="authMode === 'signup' ? 'new-password' : 'current-password'"
                  placeholder="At least 6 characters"
                  :minlength="6"
                  required
                />
              </label>

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
            </div>
          </section>
        </div>

        <StickyActionBar tone="dark">
          <p v-if="authMessage" class="mb-3 text-center text-sm font-medium text-slate-300">{{ authMessage }}</p>
          <p v-if="authError" class="mb-3 text-center text-sm font-medium text-red-300">{{ authError }}</p>

          <button
            type="submit"
            class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200 disabled:opacity-60"
            :disabled="isAuthSubmitting"
          >
            {{ isAuthSubmitting ? 'Working...' : authMode === 'login' ? 'Sign in' : 'Create account' }}
          </button>

          <button
            type="button"
            class="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-4 py-4 text-base font-bold text-white ring-1 ring-slate-700 transition hover:bg-slate-700 disabled:opacity-60"
            :disabled="isAuthSubmitting"
            @click="handleGoogleSignIn"
          >
            <UIcon name="i-lucide-chrome" class="size-5" />
            Continue with Google
          </button>
        </StickyActionBar>
      </form>

      <div v-else class="mt-6 flex min-h-0 flex-1 flex-col">
        <div class="flex-1 space-y-5 overflow-y-auto no-scrollbar pb-4">
        <section class="rounded-4xl border border-slate-800 bg-slate-900 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Your Info</p>
              <h2 class="mt-1 truncate text-xl font-bold text-white">{{ user.email }}</h2>
            </div>

            <span
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

          <p v-if="!isPro" class="mt-3 text-xs leading-5 text-slate-400">
            Free plan: 1 condition with unlimited entries, calendar view, and entry PDF exports. Upgrade for about $1.08/month to unlock more conditions, family reporting, and advanced charts in PDFs.
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

        <section class="rounded-4xl border border-slate-800 bg-slate-900 p-5">
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

        <section class="rounded-4xl border border-slate-800 bg-slate-900 p-5">
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
              @click="setLayoutMode(option.value)"
            >
              <span class="block font-bold text-white">{{ option.label }}</span>
              <span class="mt-1 block text-sm leading-6 text-slate-400">{{ option.copy }}</span>
            </button>
          </div>
        </section>

        <section class="rounded-4xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Supporter Links</p>
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
                  Family reporting links are included with Pro so supporters can submit signed observations for your claim.
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
                This label is only for you to recognize the link. The supporter enters their real info when submitting a report.
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
          <h2 class="px-1 text-xl font-bold text-white">Existing supporter profiles</h2>

          <div v-if="!supporterProfiles.length" class="rounded-4xl border border-slate-800 bg-slate-900 p-5 text-center text-sm text-slate-400">
            No supporter links yet.
          </div>

          <article
            v-for="profile in supporterProfiles"
            :key="profile.id"
            class="rounded-4xl border border-slate-800 bg-slate-900 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <h3 class="font-bold text-white">{{ profile.display_name || 'Private supporter link' }}</h3>
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
                :aria-label="`Copy link for ${profile.display_name || 'private supporter link'}`"
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

        <section class="rounded-4xl border border-slate-800 bg-slate-900 p-4">
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

        <section class="rounded-4xl border border-red-900/40 bg-slate-900 p-4">
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
        </div>

        <StickyActionBar tone="dark">
          <p v-if="pageError" class="mb-3 text-center text-sm font-medium text-red-300">{{ pageError }}</p>

          <button
            type="button"
            class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"
            :disabled="isSavingProfile"
            @click="saveProfile"
          >
            {{ isSavingProfile ? 'Saving...' : 'Save Profile' }}
          </button>

          <button
            type="button"
            class="mt-3 w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700"
            :disabled="isAuthSubmitting"
            @click="handleSignOut"
          >
            {{ isAuthSubmitting ? 'Signing out...' : 'Sign out' }}
          </button>
        </StickyActionBar>
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
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Delete supporter link</p>
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
  </main>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '../composables/useSupabaseAuth'
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
import { useTrackerLayout, TRACKER_CLOSE_EMBED_PROFILE_KEY, type TrackerLayoutMode } from '../composables/useTrackerLayout'
import { mapEntryHistoryItem } from '../utils/entryDisplay'
import { copyToClipboard } from '../utils/copyToClipboard'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const closeEmbedProfile = inject<(() => void) | null>(TRACKER_CLOSE_EMBED_PROFILE_KEY, null)

const {
  user,
  isAuthLoading,
  authError,
  signIn,
  signUp,
  signInWithGoogle,
  sendPasswordReset,
  signOut,
  verifyPassword
} = useSupabaseAuth()
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
  loadEntitlements
} = useEntitlements()
const {
  loggingCadence,
  weeklyLogDay,
  loadAppWelcomeState,
  updateLoggingCadence
} = useAppWelcome()
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
  'GERD / IBS',
  'Sleep Issues'
]

const authMode = ref<'login' | 'signup'>('login')
const authName = ref('')
const authEmail = ref('')
const authPassword = ref('')
const authConfirmPassword = ref('')
const authMessage = ref('')
const isAuthSubmitting = ref(false)

const profileForm = ref({
  full_name: ''
})
const supporterForm = ref({
  link_label: '',
  visible_conditions: [] as string[]
})
const supporterProfiles = ref<any[]>([])
const deletedEntries = ref<any[]>([])
const createdLink = ref('')
const createdLinkCopied = ref(false)
const linkedEntryId = ref<string | null>(null)
const linkedEntryContext = ref<null | { summary: string, condition: string }>(null)
const pageError = ref('')
const isSavingProfile = ref(false)
const isCreatingSupporter = ref(false)
const isRestoringEntryId = ref<string | null>(null)
const isDeletingSupporterId = ref<string | null>(null)
const isCopyingSupporterId = ref<string | null>(null)
const copiedSupporterId = ref<string | null>(null)
const pendingPurgeEntry = ref<null | { id: string, title: string }>(null)
const pendingDeleteSupporter = ref<null | { id: string, display_name: string }>(null)
const activeLogCount = ref(0)
const isDeleteAllLogsModalOpen = ref(false)
const deleteAllLogsPassword = ref('')
const deleteAllLogsConfirmPhrase = ref('')
const deleteAllLogsError = ref('')
const isDeletingAllLogs = ref(false)

const usesPasswordLogin = computed(() => {
  return Boolean(user.value?.identities?.some((identity) => identity.provider === 'email'))
})

const deletedHistoryEntries = computed(() => {
  return deletedEntries.value.map((entry) => mapEntryHistoryItem(entry, { deleted: true }))
})

onMounted(() => {
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

async function loadProfilePage() {
  pageError.value = ''
  loadDeletedEntries()

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
    supporterProfiles.value = supporters
  } catch (error) {
    pageError.value = getErrorMessage(error)
  }
}

async function saveProfile() {
  isSavingProfile.value = true
  pageError.value = ''

  try {
    await upsertProfile({
      full_name: profileForm.value.full_name,
      display_name: profileForm.value.full_name
    })
    showSubmissionToast('Profile saved.')
  } catch (error) {
    pageError.value = getErrorMessage(error)
  } finally {
    isSavingProfile.value = false
  }
}

async function saveLoggingCadence(cadence: LoggingCadence) {
  pageError.value = ''

  try {
    await updateLoggingCadence(cadence, weeklyLogDay.value)
    showSubmissionToast(cadence === 'weekly'
      ? 'Updated to weekly logging.'
      : 'Updated to daily logging.')
  } catch (error) {
    pageError.value = getErrorMessage(error)
  }
}

async function saveWeeklyLogDay(day: number) {
  pageError.value = ''

  try {
    await updateLoggingCadence('weekly', day)
    showSubmissionToast('Preferred log day updated.')
  } catch (error) {
    pageError.value = getErrorMessage(error)
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
    showSubmissionToast('Supporter link created.')
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
    display_name: profile.display_name || 'Private supporter link'
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
    showSubmissionToast('Supporter link deleted.')
    await loadProfilePage()
  } catch (error) {
    pageError.value = getErrorMessage(error)
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
  authMessage.value = ''
  authError.value = ''

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
      redirectAfterAuth()
    } else {
      const data = await signUp(authEmail.value, authPassword.value, authName.value.trim())

      if (data.session || user.value) {
        showSubmissionToast('Account created. You are signed in.')
        redirectAfterAuth()
      } else if (data.user) {
        authMessage.value = 'Account created, but sign-in did not start. Try Sign in with the same password.'
      } else {
        authMessage.value = 'Signup did not return a user. Check Supabase Auth settings and try again.'
      }
    }
  } catch {
    if (/already has a VCH account/i.test(authError.value)) {
      authMode.value = 'login'
    }
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

async function handleGoogleSignIn() {
  isAuthSubmitting.value = true
  authMessage.value = ''

  try {
    if (import.meta.client) {
      window.sessionStorage.setItem('symptom-tracker-auth-success', 'google')
    }
    await signInWithGoogle()
  } catch {
    authMessage.value = authError.value || 'Could not sign in with Google.'
  } finally {
    isAuthSubmitting.value = false
  }
}

async function handleSignOut() {
  isAuthSubmitting.value = true

  try {
    await signOut()
  } catch {
    pageError.value = authError.value
  } finally {
    isAuthSubmitting.value = false
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
</script>
