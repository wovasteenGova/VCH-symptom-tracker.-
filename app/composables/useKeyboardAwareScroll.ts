import { computed, onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useKeyboardAwareScroll(scrollEl: Ref<HTMLElement | null>) {
  const keyboardInset = ref(0)

  const scrollStyle = computed(() => {
    if (keyboardInset.value <= 0) {
      return undefined
    }

    return {
      paddingBottom: `${keyboardInset.value + 24}px`
    }
  })

  function updateKeyboardInset() {
    if (typeof window === 'undefined') {
      return
    }

    const viewport = window.visualViewport
    if (!viewport) {
      keyboardInset.value = 0
      return
    }

    keyboardInset.value = Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop))
  }

  function handleFieldFocus(event: FocusEvent) {
    const target = event.target
    if (!(target instanceof HTMLElement) || !scrollEl.value) {
      return
    }

    if (!target.matches('input, textarea, select')) {
      return
    }

    window.setTimeout(() => {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 250)
  }

  onMounted(() => {
    updateKeyboardInset()
    window.visualViewport?.addEventListener('resize', updateKeyboardInset)
    window.visualViewport?.addEventListener('scroll', updateKeyboardInset)
  })

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', updateKeyboardInset)
    window.visualViewport?.removeEventListener('scroll', updateKeyboardInset)
  })

  return {
    scrollStyle,
    handleFieldFocus,
    updateKeyboardInset
  }
}
