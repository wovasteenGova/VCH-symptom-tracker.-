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
  <div class="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 dark:border-primary/30 dark:bg-primary/10">
    <p class="text-xs font-bold uppercase tracking-[0.14em] text-primary">
      {{ tip.title }}
    </p>
    <p class="mt-1.5 leading-6 text-toned">
      {{ tip.text }}
    </p>
    <p v-if="tip.links?.length" class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
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
    <button
      type="button"
      class="mt-2 text-xs font-bold text-primary underline decoration-primary/40 underline-offset-2 transition hover:opacity-90"
      @click="$emit('showAll')"
    >
      See all tips
    </button>
  </div>
</template>
