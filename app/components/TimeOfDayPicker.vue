<template>
  <div class="space-y-3 pb-1">
    <p
      v-if="showLabel"
      class="text-center text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
    >
      Time
    </p>
    <div v-if="isMobileLayout" class="grid grid-cols-3 gap-3">
      <select
        :value="hour"
        aria-label="Hour"
        class="sym-entry-time-select w-full"
        @change="emitHour(($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="option in hourOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
      <select
        :value="minute"
        aria-label="Minute"
        class="sym-entry-time-select w-full"
        @change="emitMinute(($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="option in minuteOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
      <select
        :value="period"
        aria-label="AM or PM"
        class="sym-entry-time-select w-full"
        @change="emitPeriod(($event.target as HTMLSelectElement).value)"
      >
        <option
          v-for="option in periodOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </div>
    <div v-else class="grid grid-cols-3 gap-3">
      <USelectMenu
        :model-value="hour"
        :items="hourOptions"
        :ui="timeSelectUi"
        color="neutral"
        variant="ghost"
        size="md"
        aria-label="Hour"
        class="sym-entry-time-menu w-full"
        :popper="{ strategy: 'fixed' }"
        @update:model-value="emitHour"
      />
      <USelectMenu
        :model-value="minute"
        :items="minuteOptions"
        :ui="timeSelectUi"
        color="neutral"
        variant="ghost"
        size="md"
        aria-label="Minute"
        class="sym-entry-time-menu w-full"
        :popper="{ strategy: 'fixed' }"
        @update:model-value="emitMinute"
      />
      <USelectMenu
        :model-value="period"
        :items="periodOptions"
        :ui="timeSelectUi"
        color="neutral"
        variant="ghost"
        size="md"
        aria-label="AM or PM"
        class="sym-entry-time-menu w-full"
        :popper="{ strategy: 'fixed' }"
        @update:model-value="emitPeriod"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'

const props = withDefaults(defineProps<{
  hour: string
  minute: string
  period: string
  showLabel?: boolean
}>(), {
  showLabel: true
})

const emit = defineEmits<{
  'update:hour': [value: string]
  'update:minute': [value: string]
  'update:period': [value: string]
  change: []
}>()

const isMobileLayout = useMediaQuery('(max-width: 767px)')

const hourOptions = Array.from({ length: 12 }, (_, index) => String(index + 1))
const minuteOptions = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'))
const periodOptions = ['AM', 'PM']

const timeSelectUi = {
  base: 'w-full justify-center border-0 ring-0 shadow-none bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800',
  content: 'bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-700',
  item: 'dark:text-white'
}

function emitHour(value: string) {
  emit('update:hour', value)
  emit('change')
}

function emitMinute(value: string) {
  emit('update:minute', value)
  emit('change')
}

function emitPeriod(value: string) {
  emit('update:period', value)
  emit('change')
}
</script>
