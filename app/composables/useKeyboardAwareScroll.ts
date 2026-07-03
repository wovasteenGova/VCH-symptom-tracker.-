import { computed, onMounted, onUnmounted, ref, unref, type MaybeRef, type Ref } from 'vue'

type KeyboardAwareScrollOptions = {
  footerHeight?: MaybeRef<number>
}

export function useKeyboardAwareScroll(
  scrollEl: Ref<HTMLElement | null>,
  options: KeyboardAwareScrollOptions = {}
) {
  const keyboardInset = ref(0)

  const resolvedFooterHeight = computed(() => {
    const footerHeight = options.footerHeight
    if (footerHeight === undefined) {
      return 120
    }

    return Math.max(0, unref(footerHeight))
  })

  const isKeyboardOpen = computed(() => keyboardInset.value > 80)

  const scrollStyle = computed(() => {
    const footerReserve = resolvedFooterHeight.value
    const keyboardPadding = keyboardInset.value > 0
      ? keyboardInset.value + 16
      : 0

    return {
      paddingBottom: `${footerReserve + keyboardPadding}px`
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
      const container = scrollEl.value
      if (!container) {
        return
      }

      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const footerReserve = resolvedFooterHeight.value
      const keyboardReserve = keyboardInset.value > 0 ? keyboardInset.value + 12 : 0
      const visibleBottom = containerRect.bottom - footerReserve - keyboardReserve
      const overflow = targetRect.bottom - visibleBottom + 20

      if (overflow > 0) {
        container.scrollTop += overflow
        return
      }

      if (targetRect.top < containerRect.top + 16) {
        container.scrollTop -= containerRect.top + 16 - targetRect.top
      }
    }, 320)
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
    keyboardInset,
    isKeyboardOpen,
    scrollStyle,
    handleFieldFocus,
    updateKeyboardInset
  }
}
