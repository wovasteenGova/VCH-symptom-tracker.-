<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-1"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-1"
  >
    <div
      v-if="open"
      class="absolute bottom-[calc(100%+0.65rem)] right-0 z-20 w-[min(16rem,calc(100vw-2rem))]"
      role="status"
      aria-live="polite"
    >
      <div class="relative rounded-2xl border border-primary/30 bg-primary px-3.5 py-3 text-white shadow-xl shadow-black/20">
        <button
          type="button"
          class="absolute right-2 top-2 grid size-6 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white"
          aria-label="Dismiss backup reminder"
          @click="emit('dismiss')"
        >
          <UIcon name="i-lucide-x" class="size-3.5" />
        </button>

        <div class="flex items-start gap-2 pr-5">
          <UIcon name="i-lucide-shield-check" class="mt-0.5 size-4 shrink-0 text-white/90" />
          <p class="text-xs leading-5 text-white/95">
            {{ MONTHLY_BACKUP_REMINDER_COPY }}
          </p>
        </div>

        <span
          aria-hidden="true"
          class="pointer-events-none absolute -bottom-1.5 right-7 size-3 rotate-45 border-b border-r border-primary/30 bg-primary"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { MONTHLY_BACKUP_REMINDER_COPY } from '../utils/monthlyBackupReminder'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  dismiss: []
}>()
</script>
