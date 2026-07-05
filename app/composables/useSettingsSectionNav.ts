import { nextTick, onMounted, onUnmounted, ref, watch, type Ref } from 'vue'

export type SettingsSection = {
  id: string
  label: string
}

function getOffsetWithinScrollRoot(element: HTMLElement, root: HTMLElement) {
  const rootRect = root.getBoundingClientRect()
  const targetRect = element.getBoundingClientRect()
  return targetRect.top - rootRect.top + root.scrollTop
}

export function useSettingsSectionNav(
  scrollRoot: Ref<HTMLElement | null>,
  sections: Ref<SettingsSection[]>,
  navRoot: Ref<HTMLElement | null>,
  stripContainer?: Ref<HTMLElement | null>
) {
  const activeSectionId = ref('')
  let observer: IntersectionObserver | null = null
  let scrollEndTimer: ReturnType<typeof setTimeout> | undefined
  let isProgrammaticScroll = false

  function scrollToSection(id: string) {
    const root = scrollRoot.value
    if (!root) {
      return
    }

    const target = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
    if (!target) {
      return
    }

    isProgrammaticScroll = true
    activeSectionId.value = id

    const navHeight = navRoot.value?.offsetHeight ?? 0
    const targetTop = getOffsetWithinScrollRoot(target, root)
    const scrollTop = Math.max(0, targetTop - navHeight - 8)

    root.scrollTo({ top: scrollTop, behavior: 'smooth' })

    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer)
    }

    scrollEndTimer = setTimeout(() => {
      isProgrammaticScroll = false
    }, 700)

    scrollActiveSectionIntoView()
  }

  function scrollActiveSectionIntoView() {
    if (!activeSectionId.value) {
      return
    }

    const container = stripContainer?.value
    if (container) {
      const button = container.querySelector<HTMLElement>(
        `[data-section-id="${CSS.escape(activeSectionId.value)}"]`
      )

      button?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
      return
    }

    const pill = navRoot.value?.querySelector<HTMLElement>(
      `[data-section-id="${CSS.escape(activeSectionId.value)}"]`
    )

    pill?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    })
  }

  function setupObserver() {
    observer?.disconnect()
    observer = null

    const root = scrollRoot.value
    const ids = sections.value.map((section) => section.id)

    if (!root || !ids.length) {
      return
    }

    const visible = new Map<string, number>()

    observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScroll) {
          return
        }

        for (const entry of entries) {
          const id = entry.target.id
          if (!id) {
            continue
          }

          if (entry.isIntersecting) {
            visible.set(id, entry.intersectionRatio)
          } else {
            visible.delete(id)
          }
        }

        if (!visible.size) {
          return
        }

        const nextId = [...visible.entries()]
          .sort((left, right) => right[1] - left[1])[0]?.[0]

        if (nextId && nextId !== activeSectionId.value) {
          activeSectionId.value = nextId
          scrollActiveSectionIntoView()
        }
      },
      {
        root,
        rootMargin: '-18% 0px -52% 0px',
        threshold: [0, 0.15, 0.35, 0.55, 0.75, 1]
      }
    )

    for (const id of ids) {
      const element = root.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
      if (element) {
        observer.observe(element)
      }
    }

    if (!activeSectionId.value) {
      activeSectionId.value = ids[0] ?? ''
    }
  }

  onMounted(async () => {
    await nextTick()
    setupObserver()
  })

  onUnmounted(() => {
    observer?.disconnect()

    if (scrollEndTimer) {
      clearTimeout(scrollEndTimer)
    }
  })

  watch([scrollRoot, sections], () => {
    setupObserver()
  }, { deep: true })

  return {
    activeSectionId,
    scrollToSection
  }
}
