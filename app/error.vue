<template>
  <main class="grid min-h-screen place-items-center bg-slate-950 px-6 text-white">
    <section class="w-full max-w-md text-center">
      <UIcon name="i-lucide-triangle-alert" class="mx-auto size-12 text-amber-400" />
      <p class="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        Symptom Tracker
      </p>
      <h1 class="mt-2 text-2xl font-bold">
        {{ isNotFound ? 'Page not found' : 'Something went wrong' }}
      </h1>
      <p class="mt-3 text-sm leading-6 text-slate-300">
        {{ message }}
      </p>

      <div class="mt-6 flex flex-col gap-2">
        <button
          type="button"
          class="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950"
          @click="handleRetry"
        >
          {{ isNotFound ? 'Go to tracker' : 'Try again' }}
        </button>
        <button
          type="button"
          class="rounded-2xl bg-slate-800 px-4 py-3 text-sm font-bold text-white ring-1 ring-slate-700"
          @click="reloadPage"
        >
          Refresh page
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const isNotFound = computed(() => props.error.statusCode === 404)

const message = computed(() => {
  if (isNotFound.value) {
    return 'That page is not available. Open the tracker home to continue logging symptoms.'
  }

  if (props.error.statusCode && props.error.statusCode >= 500) {
    return 'The tracker is having trouble right now. Refresh the page or try again in a moment.'
  }

  return props.error.message || 'The tracker hit an unexpected error.'
})

async function handleRetry() {
  await clearError({ redirect: '/app' })
}

function reloadPage() {
  if (import.meta.client) {
    window.location.reload()
  }
}
</script>
