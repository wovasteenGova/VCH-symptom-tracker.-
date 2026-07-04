import { onUnmounted, ref } from 'vue'

export const PASSWORD_REVEAL_SECONDS = 5

export function useTimedPasswordReveal(durationMs = PASSWORD_REVEAL_SECONDS * 1000) {
  const visible = ref(false)
  const countdown = ref(0)
  let tickInterval: ReturnType<typeof setInterval> | undefined
  let hideTimeout: ReturnType<typeof setTimeout> | undefined

  function clearTimers() {
    if (tickInterval) {
      clearInterval(tickInterval)
      tickInterval = undefined
    }

    if (hideTimeout) {
      clearTimeout(hideTimeout)
      hideTimeout = undefined
    }
  }

  function hide() {
    clearTimers()
    visible.value = false
    countdown.value = 0
  }

  function start() {
    if (visible.value) {
      hide()
      return
    }

    clearTimers()
    visible.value = true
    countdown.value = PASSWORD_REVEAL_SECONDS

    tickInterval = setInterval(() => {
      countdown.value = Math.max(0, countdown.value - 1)

      if (countdown.value <= 0 && tickInterval) {
        clearInterval(tickInterval)
        tickInterval = undefined
      }
    }, 1000)

    hideTimeout = setTimeout(() => {
      hide()
    }, durationMs)
  }

  onUnmounted(() => {
    clearTimers()
  })

  return {
    visible,
    countdown,
    start,
    hide
  }
}
