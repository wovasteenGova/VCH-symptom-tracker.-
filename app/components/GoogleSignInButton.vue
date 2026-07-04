<script setup lang="ts">
export type GoogleSignInButtonText = 'signin_with' | 'signup_with' | 'continue_with'
export type GoogleSignInButtonTheme = 'light' | 'dark'
export type GoogleSignInButtonSize = 'large' | 'medium'

const props = withDefaults(defineProps<{
  text?: GoogleSignInButtonText
  theme?: GoogleSignInButtonTheme
  size?: GoogleSignInButtonSize
  disabled?: boolean
  block?: boolean
}>(), {
  text: 'signin_with',
  theme: 'light',
  size: 'large',
  block: true
})

defineEmits<{
  click: []
}>()

const label = computed(() => {
  switch (props.text) {
    case 'signup_with':
      return 'Sign up with Google'
    case 'continue_with':
      return 'Continue with Google'
    default:
      return 'Sign in with Google'
  }
})
</script>

<template>
  <button
    type="button"
    class="google-sign-in-btn"
    :class="[
      `google-sign-in-btn--${theme}`,
      `google-sign-in-btn--${size}`,
      { 'google-sign-in-btn--block': block }
    ]"
    :disabled="disabled"
    :aria-label="label"
    @click="$emit('click')"
  >
    <svg
      class="google-sign-in-btn__logo"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      aria-hidden="true"
    >
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
    <span class="google-sign-in-btn__text">{{ label }}</span>
  </button>
</template>

<style scoped>
.google-sign-in-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 4px;
  border-style: solid;
  border-width: 1px;
  font-family: 'Roboto', 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.25px;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}

.google-sign-in-btn--block {
  width: 100%;
}

.google-sign-in-btn--large {
  min-height: 40px;
  padding: 0 12px;
  font-size: 14px;
}

.google-sign-in-btn--medium {
  min-height: 32px;
  padding: 0 10px;
  font-size: 14px;
}

.google-sign-in-btn--light {
  background-color: #fff;
  border-color: #747775;
  color: #1f1f1f;
}

.google-sign-in-btn--light:hover:not(:disabled) {
  background-color: #f8f9fa;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.12);
}

.google-sign-in-btn--light:active:not(:disabled) {
  background-color: #f1f3f4;
}

.google-sign-in-btn--dark {
  background-color: #131314;
  border-color: #8e918f;
  color: #e3e3e3;
}

.google-sign-in-btn--dark:hover:not(:disabled) {
  background-color: #1e1f20;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.google-sign-in-btn--dark:active:not(:disabled) {
  background-color: #2a2b2c;
}

.google-sign-in-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.google-sign-in-btn__logo {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.google-sign-in-btn__text {
  white-space: nowrap;
}
</style>
