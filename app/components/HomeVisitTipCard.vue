<script setup lang="ts">
import type { HomeVisitTip } from '../utils/conditionCatalog'

defineProps<{
  tip: HomeVisitTip
}>()

defineEmits<{
  showAll: []
}>()
</script>

<template>
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
      {{ tip.title }}
    </p>
    <p class="mt-1.5 leading-6 text-slate-600 dark:text-slate-300">
      {{ tip.text }}
    </p>
    <p v-if="tip.links?.length" class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
      <a
        v-for="link in tip.links"
        :key="link.url"
        :href="link.url"
        target="_blank"
        rel="noopener"
        class="text-xs font-bold text-sky-700 underline decoration-sky-400/60 underline-offset-2 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
      >
        {{ link.label }}
      </a>
    </p>
    <button
      type="button"
      class="mt-2 text-xs font-bold text-sky-700 underline decoration-sky-400/60 underline-offset-2 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
      @click="$emit('showAll')"
    >
      See all tips
    </button>
  </div>
</template>
