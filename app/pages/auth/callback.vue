<template>
  <main class="flex min-h-dvh flex-col bg-slate-950 px-4 py-8 text-white">
    <section class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
      <div class="rounded-4xl border border-slate-800 bg-slate-900 p-6 text-center">
        <div v-if="status === 'loading'" class="space-y-4">
          <div class="mx-auto grid size-12 place-items-center rounded-full bg-slate-800">
            <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-slate-300" />
          </div>
          <h1 class="text-xl font-bold text-white">Completing sign-in</h1>
          <p class="text-sm leading-6 text-slate-400">
            Please wait while we finish connecting your account.
          </p>
        </div>

        <div v-else-if="status === 'success'" class="space-y-4">
          <div class="mx-auto grid size-12 place-items-center rounded-full bg-emerald-950 ring-1 ring-emerald-800">
            <UIcon name="i-lucide-check-circle" class="size-6 text-emerald-400" />
          </div>
          <h1 class="text-xl font-bold text-white">Signed in</h1>
          <p class="text-sm leading-6 text-slate-400">
            Redirecting you to the symptom tracker...
          </p>
        </div>

        <div v-else class="space-y-4">
          <div class="mx-auto grid size-12 place-items-center rounded-full bg-red-950 ring-1 ring-red-900">
            <UIcon name="i-lucide-alert-circle" class="size-6 text-red-400" />
          </div>
          <h1 class="text-xl font-bold text-white">Sign-in failed</h1>
          <p class="text-sm leading-6 text-slate-400">
            {{ errorMessage }}
          </p>
          <NuxtLink
            to="/app"
            class="inline-flex w-full items-center justify-center rounded-3xl bg-white px-4 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Try again
          </NuxtLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { establishSessionFromEmailLink } from '~/composables/useAuthEmailLink'

definePageMeta({
  layout: false
})

const router = useRouter()
const status = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('We could not complete sign-in. Please try again.')

onMounted(async () => {
  try {
    const { session } = await establishSessionFromEmailLink()

    if (!session) {
      status.value = 'error'
      return
    }

    status.value = 'success'
    window.sessionStorage.setItem('symptom-tracker-auth-success', '1')

    window.setTimeout(() => {
      router.push('/app')
    }, 1200)
  } catch (error) {
    status.value = 'error'

    if (error instanceof Error && error.message) {
      errorMessage.value = error.message
    }
  }
})
</script>
