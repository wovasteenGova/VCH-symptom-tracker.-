<script setup lang="ts">
import type { WeeklyLogCaution } from '../utils/loggingCadence'

defineProps<{
  open: boolean
  caution: WeeklyLogCaution | null
}>()

const emit = defineEmits<{
  close: []
  continue: []
}>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open && caution"
      class="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/70 p-4"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div class="flex items-start gap-3">
          <span
            class="grid size-11 shrink-0 place-items-center rounded-full"
            :class="caution.tone === 'soft'
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'
              : 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-200'"
          >
            <UIcon name="i-lucide-calendar-clock" class="size-5" />
          </span>
          <div class="min-w-0">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              {{ caution.daysUntilLogDay }} day{{ caution.daysUntilLogDay === 1 ? '' : 's' }} before {{ caution.logDayLabel }}
            </p>
            <h3 class="mt-1 text-xl font-bold text-slate-950 dark:text-white">{{ caution.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {{ caution.message }}
            </p>
          </div>
        </div>

        <div class="mt-5 grid gap-3">
          <button
            type="button"
            class="w-full rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            @click="emit('continue')"
          >
            Continue logging
          </button>
          <button
            type="button"
            class="w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            @click="emit('close')"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>
