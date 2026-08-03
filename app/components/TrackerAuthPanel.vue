<script setup lang="ts">
import { AUTH_NOTICES, AUTH_VALIDATION, validateSignupForm } from '../utils/authNotices'
import { isPasskeyProductionHost, PASSKEY_PRODUCTION_HOST_MESSAGE } from '../utils/passkeyHost'

const props = withDefaults(defineProps<{
  compact?: boolean
  defaultAuthMode?: 'login' | 'signup'
  postAuthRedirect?: string
}>(), {
  compact: false,
  defaultAuthMode: 'login',
  postAuthRedirect: undefined
})

const emit = defineEmits<{
  close: []
  signedIn: []
}>()

const {
  user,
  isAuthLoading,
  authError,
  signIn,
  signUp,
  resendConfirmationEmail,
  signInWithGoogle,
  syncAuthSession,
  sendPasswordReset
} = useSupabaseAuth()
const { isPasskeySupported, signInWithPasskey } = usePasskeys()

const authMode = ref<'login' | 'signup'>(props.defaultAuthMode)
const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const authValidationMessage = ref('')
const submitting = ref(false)
const needsEmailConfirmation = ref(false)
const signupPasswordReveal = useTimedPasswordReveal()

const {
  isEmailCooldownActive,
  forgotPasswordLabel,
  resendConfirmationLabel
} = useAuthEmailCooldown(email)

watch([user, isAuthLoading], async ([nextUser, loading]) => {
  if (loading || !nextUser) return
  emit('signedIn')
})

watch(authMode, () => {
  authValidationMessage.value = ''
  needsEmailConfirmation.value = false
})

async function onSubmit() {
  const validationError = validateSignupForm({
    mode: authMode.value,
    name: name.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value
  })

  if (validationError) {
    authValidationMessage.value = validationError
    return
  }

  submitting.value = true
  authValidationMessage.value = ''

  try {
    if (authMode.value === 'login') {
      await signIn(email.value, password.value)
      return
    }

    const result = await signUp(email.value, password.value, name.value.trim())
    if (result.needsEmailConfirmation) {
      needsEmailConfirmation.value = true
      authValidationMessage.value = AUTH_NOTICES.signupCheckEmail
      return
    }
  } catch {
    authValidationMessage.value = authError.value || 'Authentication failed.'
  } finally {
    submitting.value = false
  }
}

async function onGoogleSignIn() {
  submitting.value = true
  authValidationMessage.value = ''

  try {
    await signInWithGoogle(props.postAuthRedirect)
  } catch {
    authValidationMessage.value = authError.value || 'Google sign-in failed.'
    submitting.value = false
  }
}

async function onPasskeySignIn() {
  if (!isPasskeyProductionHost()) {
    authValidationMessage.value = PASSKEY_PRODUCTION_HOST_MESSAGE
    return
  }

  submitting.value = true
  authValidationMessage.value = ''

  try {
    await signInWithPasskey()
    await syncAuthSession({ attempts: 3, delayMs: 150 })
  } catch (error) {
    authValidationMessage.value = error instanceof Error
      ? error.message
      : 'Could not sign in with a passkey.'
  } finally {
    submitting.value = false
  }
}

async function onForgotPassword() {
  if (!email.value.trim()) {
    authValidationMessage.value = AUTH_VALIDATION.enterEmailForForgotPassword
    return
  }

  submitting.value = true
  authValidationMessage.value = ''

  try {
    await sendPasswordReset(email.value)
    authValidationMessage.value = AUTH_NOTICES.passwordResetSent
  } catch {
    authValidationMessage.value = authError.value || 'Could not send reset email.'
  } finally {
    submitting.value = false
  }
}

async function onResendConfirmation() {
  if (!email.value.trim()) {
    authValidationMessage.value = AUTH_VALIDATION.enterEmailForResendConfirmation
    return
  }

  submitting.value = true
  authValidationMessage.value = ''

  try {
    await resendConfirmationEmail(email.value)
    authValidationMessage.value = AUTH_NOTICES.confirmationEmailSent
  } catch {
    authValidationMessage.value = authError.value || 'Could not resend confirmation email.'
  } finally {
    submitting.value = false
  }
}

const fieldClass = 'w-full rounded-xl border border-default/80 bg-default/40 px-3.5 py-2.5 text-sm text-highlighted outline-none transition placeholder:text-muted/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/15'
const labelClass = 'mb-1.5 block text-xs font-semibold text-highlighted'

const pinnedAuthMessages = computed(() => {
  const validation = authValidationMessage.value.trim()
  return validation ? [validation] : []
})
</script>

<template>
  <div
    class="flex flex-col"
    :class="compact ? 'max-h-[min(32rem,calc(100dvh-6rem))]' : ''"
  >
    <div
      v-if="compact"
      class="flex shrink-0 items-center justify-between gap-2 border-b border-default/60 px-4 py-3"
    >
      <div class="min-w-0">
        <p class="text-sm font-semibold text-highlighted">
          Account
        </p>
        <p class="text-[11px] text-muted">
          Sign in to sync your symptom logs
        </p>
      </div>
      <button
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-elevated/60 hover:text-highlighted"
        aria-label="Close"
        @click="emit('close')"
      >
        <UIcon name="i-lucide-x" class="size-4" />
      </button>
    </div>

    <div
      v-if="isAuthLoading"
      class="p-4 text-sm text-muted"
    >
      <span class="inline-flex items-center gap-2">
        <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
        Checking your session…
      </span>
    </div>

    <form
      v-else
      class="flex min-h-0 flex-1 flex-col"
      @submit.prevent="onSubmit"
    >
      <div
        class="custom-scrollbar min-h-0 flex-1 overflow-y-auto"
        :class="compact ? 'p-4' : ''"
      >
        <AuthModeTabs v-model="authMode" tone="light" />

        <p class="mt-3 text-xs leading-5 text-muted">
          Use your Veterans Central Hub account — the same sign-in as Claim Maker.
        </p>

        <div class="mt-4 space-y-3">
          <label v-if="authMode === 'signup'" class="block">
            <span :class="labelClass">Name</span>
            <input
              v-model="name"
              type="text"
              autocomplete="name"
              :class="fieldClass"
              placeholder="Your full name"
              required
            >
          </label>

          <label class="block">
            <span :class="labelClass">Email</span>
            <input
              v-model="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              autocapitalize="none"
              :class="fieldClass"
              placeholder="you@example.com"
              required
            >
          </label>

          <label class="block">
            <span :class="labelClass">Password</span>
            <PasswordInput
              v-if="authMode === 'login'"
              key="auth-login-password"
              v-model="password"
              tone="light"
              autocomplete="current-password"
              placeholder="Your password"
              required
            />
            <PasswordInput
              v-else
              key="auth-signup-password"
              v-model="password"
              tone="light"
              autocomplete="new-password"
              placeholder="At least 6 characters"
              :minlength="6"
              :revealed="signupPasswordReveal.visible.value"
              :countdown="signupPasswordReveal.countdown.value"
              required
              @reveal="signupPasswordReveal.start"
            />
          </label>

          <label v-if="authMode === 'signup'" class="block">
            <span :class="labelClass">Confirm password</span>
            <PasswordInput
              v-model="confirmPassword"
              tone="light"
              autocomplete="new-password"
              placeholder="Re-enter password"
              :show-toggle="false"
              required
            />
          </label>

          <button
            v-if="authMode === 'login'"
            type="button"
            class="w-full rounded-xl px-3 py-2 text-xs font-semibold text-muted transition hover:bg-elevated/60 hover:text-highlighted"
            :disabled="submitting || isEmailCooldownActive"
            @click="onForgotPassword"
          >
            {{ forgotPasswordLabel }}
          </button>

          <button
            v-if="needsEmailConfirmation"
            type="button"
            class="w-full rounded-xl px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
            :disabled="submitting || !email || isEmailCooldownActive"
            @click="onResendConfirmation"
          >
            {{ resendConfirmationLabel }}
          </button>
        </div>
      </div>

      <div
        v-if="pinnedAuthMessages.length"
        class="shrink-0 space-y-2 border-t border-default/60 bg-default px-4 py-3"
      >
        <p
          v-for="(message, index) in pinnedAuthMessages"
          :key="`${index}-${message}`"
          class="text-xs font-medium leading-5 text-warning"
          :aria-live="index === 0 ? 'polite' : undefined"
        >
          {{ message }}
        </p>
      </div>

      <div
        class="shrink-0 border-t border-default/60 bg-elevated/30"
        :class="compact ? 'p-4' : 'mt-4 p-0 pt-4'"
      >
        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="submitting"
          :label="submitting ? 'Working…' : authMode === 'login' ? 'Sign in' : 'Create account'"
        />

        <GoogleSignInButton
          class="mt-2.5"
          :text="authMode === 'signup' ? 'signup_with' : 'signin_with'"
          theme="light"
          :size="compact ? 'medium' : 'large'"
          :disabled="submitting"
          @click="onGoogleSignIn"
        />

        <PasskeySignInButton
          v-if="authMode === 'login' && isPasskeySupported"
          class="mt-2.5"
          theme="light"
          :disabled="submitting"
          @click="onPasskeySignIn"
        />
      </div>
    </form>
  </div>
</template>
