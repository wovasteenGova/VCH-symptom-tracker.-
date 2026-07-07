import { computed, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import {
  AUTH_EMAIL_COOLDOWN_MS,
  formatAuthEmailCooldownMessage,
  getAuthEmailCooldownRemaining
} from '../utils/authEmailCooldown'

export function useAuthEmailCooldown(email: Ref<string>) {
  const remainingMs = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined

  function refreshCooldown() {
    remainingMs.value = getAuthEmailCooldownRemaining(email.value)
  }

  watch(email, refreshCooldown, { immediate: true })

  onMounted(() => {
    refreshCooldown()
    timer = setInterval(refreshCooldown, 1000)
  })

  onUnmounted(() => {
    if (timer) {
      clearInterval(timer)
    }
  })

  const isEmailCooldownActive = computed(() => remainingMs.value > 0)

  const resendConfirmationLabel = computed(() => {
    if (!isEmailCooldownActive.value) {
      return 'Resend confirmation email'
    }

    return formatAuthEmailCooldownMessage(remainingMs.value)
  })

  const forgotPasswordLabel = computed(() => {
    if (!isEmailCooldownActive.value) {
      return 'Forgot password?'
    }

    return formatAuthEmailCooldownMessage(remainingMs.value)
  })

  return {
    AUTH_EMAIL_COOLDOWN_MS,
    remainingMs,
    isEmailCooldownActive,
    resendConfirmationLabel,
    forgotPasswordLabel,
    refreshCooldown
  }
}
