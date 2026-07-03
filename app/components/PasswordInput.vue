<script setup lang="ts">
import { computed, ref } from 'vue'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  placeholder?: string
  autocomplete?: string
  name?: string
  required?: boolean
  minlength?: number
  tone?: 'light' | 'dark'
}>(), {
  placeholder: '',
  autocomplete: 'current-password',
  tone: 'light'
})

const visible = ref(false)

const inputClass = computed(() => {
  if (props.tone === 'dark') {
    return 'w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 py-4 pl-4 pr-12 text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400'
  }

  return 'w-full rounded-3xl border border-slate-300 bg-white py-4 pl-4 pr-12 text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400'
})

const toggleClass = computed(() => {
  if (props.tone === 'dark') {
    return 'text-slate-400 hover:text-slate-200'
  }

  return 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
})
</script>

<template>
  <div class="relative">
    <input
      v-model="model"
      :type="visible ? 'text' : 'password'"
      :name="name"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :required="required"
      :minlength="minlength"
      :class="inputClass"
    >

    <button
      type="button"
      class="absolute inset-y-0 right-0 grid w-12 place-items-center transition"
      :class="toggleClass"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <UIcon :name="visible ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-5" />
    </button>
  </div>
</template>
