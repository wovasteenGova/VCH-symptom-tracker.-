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
    <button
      type="button"
      class="mt-2 text-xs font-bold text-sky-700 underline decoration-sky-400/60 underline-offset-2 transition hover:text-sky-900 dark:text-sky-300 dark:hover:text-sky-100"
      @click="$emit('showAll')"
    >
      See all tips
    </button>
  </div>
</template>
