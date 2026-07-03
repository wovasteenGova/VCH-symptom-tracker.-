<template>
  <main class="flex min-h-dvh flex-col bg-slate-950 px-4 py-8 text-white">
    <section class="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
      <div class="rounded-4xl border border-slate-800 bg-slate-900 p-6">
        <div v-if="status === 'loading'" class="space-y-4 text-center">
          <div class="mx-auto grid size-12 place-items-center rounded-full bg-slate-800">
            <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-slate-300" />
          </div>
          <h1 class="text-xl font-bold text-white">Confirming your email</h1>
          <p class="text-sm leading-6 text-slate-400">
            Hang tight while we verify your account.
          </p>
        </div>

        <div v-else-if="status === 'success'" class="space-y-4 text-center">
          <div class="mx-auto grid size-12 place-items-center rounded-full bg-emerald-950 ring-1 ring-emerald-800">
            <UIcon name="i-lucide-check-circle" class="size-6 text-emerald-400" />
          </div>
          <h1 class="text-xl font-bold text-white">Email confirmed</h1>
          <p class="text-sm leading-6 text-slate-400">
            Your account is ready. You can sign in and start logging symptoms.
          </p>
          <NuxtLink
            to="/app"
            class="inline-flex w-full items-center justify-center rounded-3xl bg-white px-4 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            Open symptom tracker
          </NuxtLink>
        </div>

        <div v-else class="space-y-4 text-center">
          <div class="mx-auto grid size-12 place-items-center rounded-full bg-red-950 ring-1 ring-red-900">
            <UIcon name="i-lucide-alert-circle" class="size-6 text-red-400" />
          </div>
          <h1 class="text-xl font-bold text-white">Confirmation failed</h1>
          <p class="text-sm leading-6 text-slate-400">
            {{ errorMessage }}
          </p>
          <div class="flex flex-col gap-3">
            <NuxtLink
              to="/app"
              class="inline-flex w-full items-center justify-center rounded-3xl bg-white px-4 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Back to sign in
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="inline-flex w-full items-center justify-center rounded-3xl border border-slate-700 px-4 py-4 text-base font-semibold text-white transition hover:bg-slate-800"
            >
              Open profile
            </NuxtLink>
          </div>
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
const errorMessage = ref('This link may have expired. Request a new confirmation email from the sign-in screen.')

onMounted(async () => {
  try {
    const { session, linkType } = await establishSessionFromEmailLink()

    if (linkType === 'recovery') {
      await router.replace('/auth/reset-password')
      return
    }

    if (!session) {
      status.value = 'error'
      return
    }

    status.value = 'success'

    window.setTimeout(() => {
      router.push('/app')
    }, 1800)
  } catch (error) {
    status.value = 'error'

    if (error instanceof Error && error.message) {
      errorMessage.value = error.message
    }
  }
})
</script>
