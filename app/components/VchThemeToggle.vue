<script setup lang="ts">
import type { ClaimColorThemeId } from '#shared/claimColorThemes'

withDefaults(defineProps<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}>(), {
  size: 'md'
})

const colorMode = useColorMode()
const { themeId, themes, activeTheme, setTheme, hydrateThemeFromStorage } = useClaimColorTheme()
const pickerOpen = ref(false)

onMounted(() => {
  hydrateThemeFromStorage()
})

function selectTheme(id: ClaimColorThemeId) {
  setTheme(id)
  pickerOpen.value = false
}

const isDark = computed(() => colorMode.value === 'dark')
</script>

<template>
  <div class="header-theme-control flex shrink-0 items-center gap-1.5">
    <UPopover
      v-model:open="pickerOpen"
      :content="{ side: 'bottom', align: 'end', sideOffset: 8 }"
    >
      <button
        type="button"
        class="header-theme-swatch-trigger flex size-9 items-center justify-center rounded-lg border border-default/80 bg-elevated/40 transition hover:border-primary/40 hover:bg-elevated/70"
        :aria-label="`Color theme: ${activeTheme.label}. Open theme picker.`"
        :title="`Theme: ${activeTheme.label}`"
      >
        <span
          class="size-6 rounded-md border border-black/10 shadow-sm ring-1 ring-inset ring-white/30"
          :style="{ background: activeTheme.swatch }"
          aria-hidden="true"
        />
      </button>

      <template #content>
        <div class="w-[11.5rem] p-2.5">
            <p class="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
              Color theme
            </p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="theme in themes"
                :key="theme.id"
                type="button"
                class="group relative size-9 rounded-lg border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                :class="themeId === theme.id
                  ? 'border-primary ring-2 ring-primary/25'
                  : 'border-default/60 hover:border-primary/35'"
                :aria-label="theme.label"
                :aria-pressed="themeId === theme.id"
                :title="theme.label"
                @click="selectTheme(theme.id)"
              >
                <span
                  class="absolute inset-0.5 rounded-md border border-black/10"
                  :style="{ background: theme.swatch }"
                  aria-hidden="true"
                />
              </button>
            </div>
            <p class="mt-2 text-[11px] leading-snug text-muted">
              {{ activeTheme.label }}
            </p>
        </div>
      </template>
    </UPopover>

    <UColorModeSwitch
      :size="size"
      color="neutral"
      class="header-color-toggle"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    />
  </div>
</template>

<style scoped>
.header-theme-control {
  flex-shrink: 0;
}
</style>
