<template>
  <main class="min-h-dvh bg-slate-950 text-white">
    <section class="mx-auto min-h-dvh w-full max-w-md px-4 pb-8 pt-4 sm:max-w-lg">
      <header class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Profile</p>
          <h1 class="mt-1 text-2xl font-bold tracking-tight text-white">Account Settings</h1>
        </div>

        <NuxtLink
          to="/"
          class="grid size-10 place-items-center rounded-full bg-slate-900 text-white shadow-sm ring-1 ring-slate-800 transition hover:bg-slate-800"
          aria-label="Back to tracker"
        >
          <UIcon name="i-lucide-arrow-left" class="size-5" />
        </NuxtLink>
      </header>

      <section v-if="isAuthLoading" class="mt-6 rounded-4xl border border-slate-800 bg-slate-900 p-5">
        <h2 class="text-xl font-bold text-white">Loading account...</h2>
        <p class="mt-2 text-sm leading-6 text-slate-400">
          Checking your saved session.
        </p>
      </section>

      <section v-else-if="!user" class="mt-6 rounded-4xl border border-slate-800 bg-slate-900 p-5">
        <h2 class="text-xl font-bold text-white">Sign in required</h2>
        <p class="mt-2 text-sm leading-6 text-slate-400">
          Sign in from the home screen before managing your profile or supporter links.
        </p>
      </section>

      <template v-else>
        <section class="mt-6 rounded-4xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Your Info</p>
            <h2 class="mt-1 text-xl font-bold text-white">{{ user.email }}</h2>
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

            <button
              type="button"
              class="w-full rounded-2xl bg-white px-5 py-4 text-base font-bold text-slate-950 shadow-lg transition hover:bg-slate-200"
              :disabled="isSavingProfile"
              @click="saveProfile"
            >
              {{ isSavingProfile ? 'Saving...' : 'Save Profile' }}
            </button>
          </div>
        </section>

        <section class="mt-5 rounded-4xl border border-slate-800 bg-slate-900 p-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Supporter Links</p>
            <h2 class="mt-1 text-xl font-bold text-white">Family reporting access</h2>
            <p class="mt-2 text-sm leading-6 text-slate-400">
              Create a private link for someone you trust. They enter their own contact info on each report. You only choose which conditions they can see.
            </p>
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
          </div>
        </section>

        <section class="mt-5 space-y-3">
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

            <button
              type="button"
              class="mt-4 w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700"
              @click="toggleSupporter(profile)"
            >
              {{ profile.active ? 'Disable link' : 'Reactivate link' }}
            </button>
          </article>
        </section>

        <p v-if="pageMessage" class="mt-4 text-center text-sm font-medium text-slate-300">{{ pageMessage }}</p>
        <p v-if="pageError" class="mt-4 text-center text-sm font-medium text-red-300">{{ pageError }}</p>
      </template>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useSupabaseAuth } from '../composables/useSupabaseAuth'
import { useUserProfiles } from '../composables/useUserProfiles'
import { onMounted, ref, watch } from 'vue'

const { user, isAuthLoading } = useSupabaseAuth()
const {
  getProfile,
  upsertProfile,
  listSupporterProfiles,
  createSupporterProfile,
  toggleSupporterProfile
} = useUserProfiles()

const conditionOptions = [
  'PTSD / Mental Health',
  'Back or Joint Pain',
  'Nerve / Radiculopathy',
  'Migraine / Headache',
  'GERD / IBS',
  'Sleep Issues'
]

const profileForm = ref({
  full_name: ''
})
const supporterForm = ref({
  link_label: '',
  visible_conditions: [] as string[]
})
const supporterProfiles = ref<any[]>([])
const createdLink = ref('')
const pageMessage = ref('')
const pageError = ref('')
const isSavingProfile = ref(false)
const isCreatingSupporter = ref(false)

onMounted(() => {
  if (user.value) {
    loadProfilePage()
  }
})

watch(user, (currentUser) => {
  if (currentUser) {
    loadProfilePage()
  }
})

watch(isAuthLoading, (loading) => {
  if (!loading && user.value) {
    loadProfilePage()
  }
})

async function loadProfilePage() {
  pageError.value = ''

  try {
    const [profile, supporters] = await Promise.all([
      getProfile(),
      listSupporterProfiles()
    ])

    profileForm.value.full_name = profile?.full_name || user.value?.user_metadata?.full_name || ''
    supporterProfiles.value = supporters
  } catch (error) {
    pageError.value = getErrorMessage(error)
  }
}

async function saveProfile() {
  isSavingProfile.value = true
  pageMessage.value = ''
  pageError.value = ''

  try {
    await upsertProfile({
      full_name: profileForm.value.full_name,
      display_name: profileForm.value.full_name
    })
    pageMessage.value = 'Profile saved.'
  } catch (error) {
    pageError.value = getErrorMessage(error)
  } finally {
    isSavingProfile.value = false
  }
}

async function createSupporter() {
  pageMessage.value = ''
  pageError.value = ''
  createdLink.value = ''

  if (!supporterForm.value.visible_conditions.length) {
    pageError.value = 'Choose at least one visible condition.'
    return
  }

  isCreatingSupporter.value = true

  try {
    const { token } = await createSupporterProfile(supporterForm.value)
    createdLink.value = `${window.location.origin}/report/${token}`
    supporterForm.value = {
      link_label: '',
      visible_conditions: []
    }
    await loadProfilePage()
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}
</script>
