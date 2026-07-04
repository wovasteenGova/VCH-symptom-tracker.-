<script setup lang="ts">
export type PasskeySignInButtonTheme = 'light' | 'dark'

withDefaults(defineProps<{
  theme?: PasskeySignInButtonTheme
  disabled?: boolean
  label?: string
}>(), {
  theme: 'light',
  label: 'Sign in with a passkey'
})

defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="passkey-sign-in-btn"
    :class="`passkey-sign-in-btn--${theme}`"
    :disabled="disabled"
    :aria-label="label"
    @click="$emit('click')"
  >
    <span class="passkey-sign-in-btn__icon-wrap">
      <UIcon name="i-lucide-fingerprint" class="passkey-sign-in-btn__icon" aria-hidden="true" />
    </span>
    <span class="passkey-sign-in-btn__text">{{ label }}</span>
  </button>
</template>

<style scoped>
.passkey-sign-in-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 56px;
  padding: 0 16px;
  border-radius: 1rem;
  border: 1px solid transparent;
  font: inherit;
  font-weight: 700;
  font-size: 1rem;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  cursor: pointer;
}

.passkey-sign-in-btn--light {
  background-color: #ffffff;
  border-color: rgb(203 213 225); /* slate-300 */
  color: rgb(2 6 23); /* slate-950 */
}

.passkey-sign-in-btn--light:hover:not(:disabled) {
  background-color: rgb(248 250 252); /* slate-50 */
  border-color: rgb(148 163 184); /* slate-400 */
}

.passkey-sign-in-btn--dark {
  background-color: rgb(30 41 59 / 0.8); /* slate-800 */
  border-color: rgb(51 65 85); /* slate-700 */
  color: #ffffff;
}

.passkey-sign-in-btn--dark:hover:not(:disabled) {
  background-color: rgb(51 65 85 / 0.9); /* slate-700 */
  border-color: rgb(71 85 105); /* slate-600 */
}

.passkey-sign-in-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.passkey-sign-in-btn__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 9999px;
  padding: 4px;
}

.passkey-sign-in-btn--light .passkey-sign-in-btn__icon-wrap {
  background-color: rgb(224 242 254); /* sky-100 */
}

.passkey-sign-in-btn--dark .passkey-sign-in-btn__icon-wrap {
  background-color: rgb(12 74 110 / 0.6); /* sky-900 */
}

.passkey-sign-in-btn__icon {
  width: 20px;
  height: 20px;
}

.passkey-sign-in-btn--light .passkey-sign-in-btn__icon {
  color: rgb(2 132 199); /* sky-600 */
}

.passkey-sign-in-btn--dark .passkey-sign-in-btn__icon {
  color: rgb(125 211 252); /* sky-300 */
}

.passkey-sign-in-btn__text {
  white-space: nowrap;
}
</style>
