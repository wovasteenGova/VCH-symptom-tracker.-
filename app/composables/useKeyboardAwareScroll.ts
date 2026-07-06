import { computed, onMounted, onUnmounted, ref, unref, type MaybeRef, type Ref } from 'vue'

type KeyboardAwareScrollOptions = {
  footerHeight?: MaybeRef<number>
}

const KEYBOARD_OPEN_THRESHOLD = 80
const FIELD_KEYBOARD_GAP = 12
const FIELD_TOP_GAP = 16

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

  const isKeyboardOpen = computed(() => keyboardInset.value > KEYBOARD_OPEN_THRESHOLD)

  const scrollStyle = computed(() => {
    if (isKeyboardOpen.value) {
      // Footer chrome is hidden while the keyboard is open; only reserve keyboard scroll room.
      return {
        paddingBottom: `${Math.max(FIELD_TOP_GAP, keyboardInset.value)}px`
      }
    }

    return {
      paddingBottom: `${resolvedFooterHeight.value}px`
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

  function scrollFocusedFieldIntoView(target: HTMLElement) {
    const container = scrollEl.value
    if (!container) {
      return
    }

    updateKeyboardInset()

    const keyboardOpen = keyboardInset.value > KEYBOARD_OPEN_THRESHOLD
    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const viewport = window.visualViewport

    let visibleBottom: number
    if (viewport && keyboardOpen) {
      visibleBottom = viewport.offsetTop + viewport.height - FIELD_KEYBOARD_GAP
    } else {
      const footerReserve = keyboardOpen ? 0 : resolvedFooterHeight.value
      visibleBottom = containerRect.bottom - footerReserve - FIELD_KEYBOARD_GAP
    }

    const overflow = targetRect.bottom - visibleBottom
    if (overflow > 0) {
      container.scrollTop += overflow
      return
    }

    const visibleTop = viewport && keyboardOpen
      ? viewport.offsetTop + FIELD_TOP_GAP
      : containerRect.top + FIELD_TOP_GAP

    if (targetRect.top < visibleTop) {
      container.scrollTop -= visibleTop - targetRect.top
    }
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
      scrollFocusedFieldIntoView(target)
    }, 280)
  }

  function handleViewportChange() {
    updateKeyboardInset()

    const active = document.activeElement
    if (!(active instanceof HTMLElement) || !scrollEl.value?.contains(active)) {
      return
    }

    if (!active.matches('input, textarea, select')) {
      return
    }

    window.requestAnimationFrame(() => {
      scrollFocusedFieldIntoView(active)
    })
  }

  onMounted(() => {
    updateKeyboardInset()
    window.visualViewport?.addEventListener('resize', handleViewportChange)
    window.visualViewport?.addEventListener('scroll', handleViewportChange)
  })

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', handleViewportChange)
    window.visualViewport?.removeEventListener('scroll', handleViewportChange)
  })

  return {
    keyboardInset,
    isKeyboardOpen,
    scrollStyle,
    handleFieldFocus,
    updateKeyboardInset
  }
}
