<script setup lang="ts">
import { computed } from 'vue'
import { useTimedPasswordReveal } from '../composables/useTimedPasswordReveal'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  placeholder?: string
  autocomplete?: string
  name?: string
  required?: boolean
  minlength?: number
  tone?: 'light' | 'dark' | 'theme'
  showToggle?: boolean
  revealed?: boolean
  countdown?: number
}>(), {
  placeholder: '',
  autocomplete: 'current-password',
  tone: 'light',
  showToggle: true
})

const emit = defineEmits<{
  reveal: []
}>()

const internalReveal = useTimedPasswordReveal()
const isControlled = computed(() => props.revealed !== undefined)

const isRevealed = computed(() => {
  return isControlled.value ? props.revealed! : internalReveal.visible.value
})

const displayCountdown = computed(() => {
  if (isControlled.value && props.countdown !== undefined) {
    return props.countdown
  }

  return internalReveal.countdown.value
})

const inputClass = computed(() => {
  const padding = props.showToggle ? 'py-2.5 pl-3.5 pr-12' : 'px-3.5 py-2.5'

  if (props.tone === 'theme') {
    return `w-full rounded-xl border border-default/80 bg-default/40 ${padding} text-sm text-highlighted outline-none transition placeholder:text-muted/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15`
  }

  if (props.tone === 'dark') {
    return `w-full rounded-3xl border border-slate-600/70 bg-slate-800/70 ${padding} text-base font-medium text-white outline-none placeholder:text-slate-400 focus:border-slate-400`
  }

  return `w-full rounded-3xl border border-slate-300 bg-white ${padding} text-base font-medium text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-600/70 dark:bg-slate-800/70 dark:text-white dark:focus:border-slate-400`
})

const toggleClass = computed(() => {
  if (props.tone === 'theme') {
    return 'text-muted hover:text-highlighted'
  }

  if (props.tone === 'dark') {
    return 'text-slate-400 hover:text-slate-200'
  }

  return 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
})

function handleToggle() {
  if (isControlled.value) {
    emit('reveal')
    return
  }

  internalReveal.start()
}
</script>

<template>
  <div class="relative">
    <input
      v-model="model"
      :type="isRevealed ? 'text' : 'password'"
      :name="name"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :required="required"
      :minlength="minlength"
      :class="inputClass"
    >

    <button
      v-if="showToggle"
      type="button"
      class="absolute inset-y-0 right-0 flex items-center justify-center gap-1 transition"
      :class="[toggleClass, tone === 'theme' ? 'w-12' : 'w-16']"
      :aria-label="isRevealed ? 'Hide password' : 'Show password briefly'"
      :aria-pressed="isRevealed"
      @click="handleToggle"
    >
      <span
        v-if="isRevealed && displayCountdown > 0"
        class="min-w-4 text-center text-xs font-bold tabular-nums"
        aria-hidden="true"
      >
        {{ displayCountdown }}
      </span>
      <UIcon :name="isRevealed ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-5" />
    </button>
  </div>
</template>
