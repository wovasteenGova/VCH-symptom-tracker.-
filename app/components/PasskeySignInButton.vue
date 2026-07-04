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
    <UIcon name="i-lucide-fingerprint" class="passkey-sign-in-btn__icon" aria-hidden="true" />
    <span class="passkey-sign-in-btn__text">{{ label }}</span>
  </button>
</template>

<style scoped>
.passkey-sign-in-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 40px;
  padding: 0 12px;
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  font-family: 'Roboto', 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.25px;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}

.passkey-sign-in-btn--light {
  background-color: #fff;
  border-color: #747775;
  color: #1f1f1f;
}

.passkey-sign-in-btn--light:hover:not(:disabled) {
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.12);
}

.passkey-sign-in-btn--dark {
  background-color: #131314;
  border-color: #8e918f;
  color: #e3e3e3;
}

.passkey-sign-in-btn--dark:hover:not(:disabled) {
  background-color: #1e1f20;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.passkey-sign-in-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.passkey-sign-in-btn__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.passkey-sign-in-btn__text {
  white-space: nowrap;
}
</style>
