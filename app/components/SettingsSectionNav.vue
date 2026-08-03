<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, toRef, watch } from 'vue'
import { useSettingsSectionNav, type SettingsSection } from '../composables/useSettingsSectionNav'
import { useTrackerSettingsSectionMenuOpen } from '../composables/useTrackerSettingsSectionMenuOpen'

const props = defineProps<{
  sections: SettingsSection[]
  scrollRoot: HTMLElement | null
  compact?: boolean
  readable?: boolean
}>()

const navRoot = ref<HTMLElement | null>(null)
const menuToggleRef = ref<HTMLElement | null>(null)
const mobileMenuRef = ref<HTMLElement | null>(null)
const stripContainer = ref<HTMLElement | null>(null)
const scrollRootRef = toRef(() => props.scrollRoot)
const sectionsRef = toRef(() => props.sections)
const isMobileMenuOpen = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const mobileMenuStyle = ref<{ top: string, right: string, maxHeight: string } | null>(null)
const { settingsSectionMenuOpen } = useTrackerSettingsSectionMenuOpen()

const { activeSectionId, scrollToSection } = useSettingsSectionNav(
  scrollRootRef,
  sectionsRef,
  navRoot,
  stripContainer
)

const activeSectionLabel = computed(() => {
  return props.sections.find((section) => section.id === activeSectionId.value)?.label
    ?? props.sections[0]?.label
    ?? 'Sections'
})

const isLargeScreen = ref(false)
let largeScreenMedia: MediaQueryList | null = null

const useMobileNav = computed(() => props.compact || !isLargeScreen.value)
const useReadableNavSizing = computed(() => Boolean(props.readable && !props.compact))

function activeTabStyle(isActive: boolean) {
  if (!isActive) {
    return {}
  }

  return {
    borderLeft: '3px solid var(--ui-primary)',
    borderRight: '3px solid var(--ui-primary)',
    paddingLeft: '9px',
    paddingRight: '9px'
  }
}

function updateMobileMenuPosition() {
  const toggle = menuToggleRef.value
  if (!toggle) return

  const rect = toggle.getBoundingClientRect()
  const margin = 8
  const viewportPadding = 16
  const top = rect.bottom + margin
  const right = Math.max(viewportPadding, window.innerWidth - rect.right)
  const maxHeight = Math.max(160, window.innerHeight - top - viewportPadding)

  mobileMenuStyle.value = {
    top: `${top}px`,
    right: `${right}px`,
    maxHeight: `${maxHeight}px`
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    nextTick(updateMobileMenuPosition)
  }
}

function scrollToSectionAndCloseMobile(id: string) {
  scrollToSection(id)
  window.setTimeout(() => {
    isMobileMenuOpen.value = false
  }, 100)
}

function updateScrollButtons() {
  const container = stripContainer.value
  if (!container) {
    canScrollLeft.value = false
    canScrollRight.value = false
    return
  }

  const maxScrollLeft = container.scrollWidth - container.clientWidth
  canScrollLeft.value = container.scrollLeft > 4
  canScrollRight.value = maxScrollLeft - container.scrollLeft > 4
}

function scrollStrip(delta: number) {
  stripContainer.value?.scrollBy({ left: delta, behavior: 'smooth' })
}

function handleDocumentClick(event: MouseEvent) {
  if (!isMobileMenuOpen.value) return

  const target = event.target as Node
  if (navRoot.value?.contains(target)) return
  if (mobileMenuRef.value?.contains(target)) return

  isMobileMenuOpen.value = false
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}

function onLargeScreenChange(event: MediaQueryListEvent) {
  isLargeScreen.value = event.matches
}

onMounted(() => {
  if (import.meta.client) {
    largeScreenMedia = window.matchMedia('(min-width: 1024px)')
    isLargeScreen.value = largeScreenMedia.matches
    largeScreenMedia.addEventListener('change', onLargeScreenChange)
  }

  updateScrollButtons()
  window.addEventListener('resize', updateScrollButtons)
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleDocumentKeydown)
})

onUnmounted(() => {
  settingsSectionMenuOpen.value = false
  largeScreenMedia?.removeEventListener('change', onLargeScreenChange)
  window.removeEventListener('resize', updateScrollButtons)
  window.removeEventListener('resize', updateMobileMenuPosition)
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})

watch([sectionsRef, activeSectionId], () => {
  requestAnimationFrame(updateScrollButtons)
})

watch(isMobileMenuOpen, (open) => {
  settingsSectionMenuOpen.value = open

  if (!import.meta.client) return

  if (open) {
    nextTick(updateMobileMenuPosition)
    window.addEventListener('resize', updateMobileMenuPosition)
  } else {
    window.removeEventListener('resize', updateMobileMenuPosition)
    mobileMenuStyle.value = null
  }
})
</script>

<template>
  <nav
    ref="navRoot"
    aria-label="Settings sections"
    class="settings-section-nav relative z-30 shrink-0 border-b border-default/70 bg-default/95 backdrop-blur-md"
  >
    <!-- Mobile / compact: current section + sections menu -->
    <div
      v-if="useMobileNav"
      :class="useReadableNavSizing ? 'flex items-center gap-2.5 px-3 py-3' : 'flex items-center gap-2 px-2 py-2'"
    >
      <div
        class="min-w-0 flex-1 rounded-lg border border-default/70 bg-elevated/30 shadow-sm"
        :class="useReadableNavSizing ? 'px-4 py-3' : 'px-3 py-2'"
      >
        <div class="flex items-center gap-2.5">
          <UIcon
            name="i-lucide-bookmark"
            :class="useReadableNavSizing ? 'size-5 shrink-0 text-primary' : 'size-4 shrink-0 text-primary'"
          />
          <span
            class="truncate font-medium text-highlighted"
            :class="useReadableNavSizing ? 'text-base font-semibold' : 'text-sm'"
          >{{ activeSectionLabel }}</span>
        </div>
      </div>

      <button
        ref="menuToggleRef"
        type="button"
        class="grid shrink-0 place-items-center rounded-lg border border-default/70 bg-elevated/30 text-primary shadow-sm transition hover:bg-elevated/60"
        :class="[
          useReadableNavSizing ? 'size-11' : 'size-9',
          { 'border-primary bg-primary/15': isMobileMenuOpen }
        ]"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="settings-section-menu"
        aria-label="Page sections"
        @click="toggleMobileMenu"
      >
        <UIcon :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-list'" class="size-5" />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="useMobileNav && isMobileMenuOpen"
        ref="mobileMenuRef"
        id="settings-section-menu"
        data-settings-section-menu
        class="fixed z-[100] flex flex-col overflow-hidden rounded-xl border border-default/70 bg-default shadow-lg"
        :class="useReadableNavSizing ? 'w-[min(20rem,calc(100vw-1.5rem))]' : 'w-[min(280px,calc(100vw-2rem))]'"
        :style="mobileMenuStyle ?? undefined"
        @mousedown.stop
        @click.stop
      >
        <div class="shrink-0 border-b border-default/60 px-4 py-3">
          <h3
            class="flex items-center font-semibold text-highlighted"
            :class="useReadableNavSizing ? 'text-base' : 'text-sm'"
          >
            <UIcon
              name="i-lucide-bookmark"
              :class="useReadableNavSizing ? 'mr-2.5 size-5 text-primary' : 'mr-2 size-4 text-primary'"
            />
            Page sections
          </h3>
          <p
            class="mt-1 text-muted"
            :class="useReadableNavSizing ? 'text-sm' : 'text-xs'"
          >
            Navigate to sections on this page
          </p>
        </div>

        <div class="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            class="mb-1 flex w-full items-center rounded-lg px-3 text-left transition"
            :class="[
              useReadableNavSizing ? 'py-3.5 text-base' : 'py-2.5 text-sm',
              activeSectionId === section.id
                ? 'bg-primary/10 font-semibold text-highlighted'
                : 'text-muted hover:bg-elevated/50 hover:text-highlighted'
            ]"
            :aria-current="activeSectionId === section.id ? 'location' : undefined"
            @click="scrollToSectionAndCloseMobile(section.id)"
          >
            <span class="truncate">{{ section.label }}</span>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Desktop expanded: horizontal section strip -->
    <div
      v-if="!useMobileNav"
      :class="useReadableNavSizing ? 'flex h-14 items-stretch' : 'flex h-12 items-stretch'"
    >
      <div class="flex min-w-[3rem] items-center justify-start pl-1">
        <button
          v-show="canScrollLeft"
          type="button"
          class="grid size-8 place-items-center rounded-md bg-primary text-inverted shadow-sm transition hover:bg-primary/90"
          aria-label="Scroll sections left"
          @click="scrollStrip(-200)"
        >
          <UIcon name="i-lucide-chevron-left" class="size-4" />
        </button>
      </div>

      <div class="relative min-w-0 flex-1 overflow-hidden">
        <div
          ref="stripContainer"
          class="flex h-full items-center overflow-x-auto scrollbar-hide"
          :class="canScrollLeft || canScrollRight ? 'justify-start' : 'justify-center'"
          @scroll.passive="updateScrollButtons"
        >
          <div
            class="flex min-w-max items-center gap-2 px-2"
            :class="canScrollLeft || canScrollRight ? 'justify-start' : 'justify-center'"
          >
            <template v-for="(section, index) in sections" :key="section.id">
              <button
                type="button"
                :data-section-id="section.id"
                class="section-button shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 font-semibold transition"
                :class="[
                  useReadableNavSizing ? 'py-2 text-sm' : 'py-1.5 text-xs',
                  activeSectionId === section.id
                    ? 'bg-elevated text-highlighted'
                    : 'text-muted hover:bg-elevated/60 hover:text-highlighted'
                ]"
                :style="activeTabStyle(activeSectionId === section.id)"
                :aria-current="activeSectionId === section.id ? 'location' : undefined"
                @click="scrollToSection(section.id)"
              >
                {{ section.label }}
              </button>

              <UIcon
                v-if="index < sections.length - 1"
                name="i-lucide-chevron-right"
                class="size-4 shrink-0 text-muted/50"
                aria-hidden="true"
              />
            </template>
          </div>
        </div>
      </div>

      <div class="flex min-w-[3rem] items-center justify-end pr-1">
        <button
          v-show="canScrollRight"
          type="button"
          class="grid size-8 place-items-center rounded-md bg-primary text-inverted shadow-sm transition hover:bg-primary/90"
          aria-label="Scroll sections right"
          @click="scrollStrip(200)"
        >
          <UIcon name="i-lucide-chevron-right" class="size-4" />
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.section-button {
  min-width: 4rem;
  max-width: 280px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
