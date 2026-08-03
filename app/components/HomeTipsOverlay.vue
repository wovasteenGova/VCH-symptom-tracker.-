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
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <AppOverlayShell
      v-if="open"
      backdrop-class="bg-black/55"
      @dismiss="$emit('close')"
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
          class="app-overlay-panel app-overlay-panel--stack overflow-hidden rounded-[1.75rem] bg-elevated shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="home-tips-title"
        >
          <div class="flex shrink-0 items-start justify-between gap-3 border-b border-default px-5 py-4">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                Tips
              </p>
              <h2 id="home-tips-title" class="mt-1 text-xl font-bold text-highlighted">
                All logging tips
              </h2>
            </div>
            <button
              type="button"
              class="grid size-10 place-items-center rounded-full bg-muted text-toned transition hover:bg-accented"
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
              class="border-b border-default py-4 last:border-b-0"
            >
              <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                {{ tip.title }}
              </p>
              <p class="mt-2 text-sm leading-6 text-toned">
                {{ tip.text }}
              </p>
              <p v-if="tip.links?.length" class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <a
                  v-for="link in tip.links"
                  :key="link.url"
                  :href="link.url"
                  target="_blank"
                  rel="noopener"
                  class="text-xs font-bold text-primary underline decoration-primary/40 underline-offset-2 transition hover:opacity-90"
                >
                  {{ link.label }}
                </a>
              </p>
            </article>
          </div>
        </section>
      </Transition>
    </AppOverlayShell>
  </Transition>
</template>
