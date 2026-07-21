import { computed, ref } from 'vue'

export function useTrackerDemoMode() {
  const isPaused = ref(false)
  const isUserControlled = ref(false)

  const isRunning = computed(() => !isPaused.value && !isUserControlled.value)

  function pause() {
    isPaused.value = true
  }

  function resume() {
    if (!isUserControlled.value) {
      isPaused.value = false
    }
  }

  function takeOver() {
    isUserControlled.value = true
    isPaused.value = true
  }

  function reset() {
    isPaused.value = false
    isUserControlled.value = false
  }

  return {
    isPaused,
    isUserControlled,
    isRunning,
    pause,
    resume,
    takeOver,
    reset
  }
}
