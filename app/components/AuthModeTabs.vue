<script setup lang="ts">
const authModes = [
  { value: 'login', label: 'Sign in' },
  { value: 'signup', label: 'Create account' }
] as const

const model = defineModel<'login' | 'signup'>({ required: true })

withDefaults(defineProps<{
  tone?: 'light' | 'dark'
}>(), {
  tone: 'light'
})
</script>

<template>
  <div
    class="rounded-full p-1"
    :class="tone === 'dark' ? 'bg-slate-950/70 ring-1 ring-slate-800' : 'bg-slate-100 dark:bg-slate-800/80'"
    role="tablist"
    aria-label="Account access"
  >
    <div class="grid grid-cols-2 gap-1">
      <button
        v-for="mode in authModes"
        :key="mode.value"
        type="button"
        role="tab"
        class="rounded-full px-4 py-3 text-sm font-semibold transition"
        :class="model === mode.value
          ? tone === 'dark'
            ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600/70'
            : 'bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white'
          : tone === 'dark'
            ? 'text-slate-400 hover:text-slate-200'
            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
        :aria-selected="model === mode.value"
        @click="model = mode.value"
      >
        {{ mode.label }}
      </button>
    </div>
  </div>
</template>
