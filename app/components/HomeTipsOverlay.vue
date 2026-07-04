<script setup lang="ts">
import type { HomeVisitTip } from '../utils/conditionCatalog'

defineProps<{
  open: boolean
  tips: HomeVisitTip[]
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
        @click.self="$emit('close')"
      >
        <Transition
          enter-active-class="transition duration-250 ease-out"
          enter-from-class="translate-y-6 opacity-0 sm:translate-y-0 sm:scale-95"
          enter-to-class="translate-y-0 opacity-100 sm:scale-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-y-0 opacity-100 sm:scale-100"
          leave-to-class="translate-y-4 opacity-0 sm:translate-y-0 sm:scale-95"
        >
          <section
            v-if="open"
            class="flex max-h-[min(82dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-tips-title"
          >
            <div class="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Tips
                </p>
                <h2 id="home-tips-title" class="mt-1 text-xl font-bold text-slate-950 dark:text-white">
                  All logging tips
                </h2>
              </div>
              <button
                type="button"
                class="grid size-10 place-items-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                aria-label="Close tips"
                @click="$emit('close')"
              >
                <UIcon name="i-lucide-x" class="size-5" />
              </button>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 no-scrollbar">
              <article
                v-for="(tip, index) in tips"
                :key="`${tip.title}-${index}`"
                class="border-b border-slate-200 py-4 last:border-b-0 dark:border-slate-800"
              >
                <p class="text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
                  {{ tip.title }}
                </p>
                <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {{ tip.text }}
                </p>
              </article>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
