<template>
  <div
    class="sticky bottom-0 z-30 -mx-4 border-t px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md supports-[backdrop-filter]:bg-opacity-90 sm:-mx-0"
    :class="tone === 'dark'
      ? 'border-slate-800 bg-slate-950/95 supports-[backdrop-filter]:bg-slate-950/85'
      : 'border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-950/95 supports-[backdrop-filter]:bg-slate-50/85 dark:supports-[backdrop-filter]:bg-slate-950/85'"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  tone?: 'light' | 'dark'
}>(), {
  tone: 'light'
})
</script>
