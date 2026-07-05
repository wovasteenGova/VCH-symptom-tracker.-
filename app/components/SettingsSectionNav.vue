<template>
  <nav
    ref="navRoot"
    aria-label="Settings sections"
    class="settings-section-nav relative z-30 shrink-0 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md"
  >
    <!-- Mobile: VCH-style current section + sections menu -->
    <div class="flex items-center gap-3 py-2 lg:hidden">
      <div
        class="min-w-0 flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 shadow-sm"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bookmark" class="size-4 shrink-0 text-sky-400" />
          <span class="truncate text-sm font-medium text-white">{{ activeSectionLabel }}</span>
        </div>
      </div>

      <button
        type="button"
        class="legend-toggle-button grid size-10 shrink-0 place-items-center rounded-lg border border-slate-800 bg-slate-900 text-sky-400 shadow-sm transition hover:bg-slate-800"
        :class="{ 'is-active': isMobileMenuOpen }"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="settings-section-menu"
        aria-label="Page sections"
        @click="toggleMobileMenu"
      >
        <UIcon :name="isMobileMenuOpen ? 'i-lucide-x' : 'i-lucide-list'" class="size-5" />
      </button>
    </div>

    <!-- Mobile dropdown menu -->
    <div
      v-if="isMobileMenuOpen"
      id="settings-section-menu"
      class="mobile-section-menu absolute right-0 top-full z-50 mt-2 w-[min(280px,calc(100vw-2rem))] rounded-lg border border-slate-800 bg-slate-900 shadow-lg lg:hidden"
    >
      <div class="max-h-[70vh] overflow-y-auto py-2">
        <div class="mb-2 border-b border-slate-800 px-4 py-2">
          <h3 class="flex items-center text-sm font-semibold text-white">
            <UIcon name="i-lucide-bookmark" class="mr-2 size-4 text-sky-400" />
            Page Sections
          </h3>
          <p class="mt-1 text-xs text-slate-400">
            Navigate to sections on this page
          </p>
        </div>

        <div class="px-2">
          <button
            v-for="section in sections"
            :key="section.id"
            type="button"
            class="mb-1 flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm transition"
            :class="activeSectionId === section.id
              ? 'bg-slate-800 font-medium text-white'
              : 'text-slate-300 hover:bg-slate-800/60'"
            :aria-current="activeSectionId === section.id ? 'location' : undefined"
            @click="scrollToSectionAndCloseMobile(section.id)"
          >
            <span class="truncate">{{ section.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop: VCH-style horizontal section strip -->
    <div class="hidden h-12 items-stretch lg:flex">
      <div class="flex min-w-[3rem] items-center justify-start pl-1">
        <button
          v-show="canScrollLeft"
          type="button"
          class="scroll-button grid size-8 place-items-center rounded-md bg-sky-600 text-white shadow-sm transition hover:bg-sky-500"
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
                class="section-button shrink-0 cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition"
                :class="activeSectionId === section.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800/60'"
                :style="getActiveBorderStyle(activeSectionId === section.id)"
                :aria-current="activeSectionId === section.id ? 'location' : undefined"
                @click="scrollToSection(section.id)"
              >
                {{ section.label }}
              </button>

              <UIcon
                v-if="index < sections.length - 1"
                name="i-lucide-chevron-right"
                class="size-4 shrink-0 text-slate-600"
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
          class="scroll-button grid size-8 place-items-center rounded-md bg-sky-600 text-white shadow-sm transition hover:bg-sky-500"
          aria-label="Scroll sections right"
          @click="scrollStrip(200)"
        >
          <UIcon name="i-lucide-chevron-right" class="size-4" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, toRef, watch } from 'vue'
import { useSettingsSectionNav, type SettingsSection } from '../composables/useSettingsSectionNav'

const props = defineProps<{
  sections: SettingsSection[]
  scrollRoot: HTMLElement | null
}>()

const navRoot = ref<HTMLElement | null>(null)
const stripContainer = ref<HTMLElement | null>(null)
const scrollRootRef = toRef(() => props.scrollRoot)
const sectionsRef = toRef(() => props.sections)
const isMobileMenuOpen = ref(false)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

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

function getActiveBorderStyle(isActive: boolean) {
  if (!isActive) {
    return {}
  }

  return {
    borderLeft: '3px solid #38bdf8',
    borderRight: '3px solid #38bdf8',
    paddingLeft: '9px',
    paddingRight: '9px'
  }
}

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
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
  if (!isMobileMenuOpen.value || !navRoot.value) {
    return
  }

  if (!navRoot.value.contains(event.target as Node)) {
    isMobileMenuOpen.value = false
  }
}

onMounted(() => {
  updateScrollButtons()
  window.addEventListener('resize', updateScrollButtons)
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollButtons)
  document.removeEventListener('click', handleDocumentClick)
})

watch([sectionsRef, activeSectionId], () => {
  requestAnimationFrame(updateScrollButtons)
})
</script>

<style scoped>
.legend-toggle-button.is-active {
  background-color: #0284c7;
  border-color: transparent;
  color: #fff;
}

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

.mobile-section-menu {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.35);
}
</style>
