<template>
  <UCalendar
    v-model="modelValue"
    v-model:placeholder="placeholder"
    :view-control="false"
    class="mx-auto w-full"
    data-step-swipe-block
  >
    <template #day="{ day }">
      <span
        class="inline-flex min-h-[1.75rem] min-w-[1.75rem] items-center justify-center leading-none"
        :class="hasLoggedEntryOnDay(day) ? 'text-base' : 'text-sm font-semibold'"
        :title="getLoggedDaySeverityTitle(day)"
      >
        {{ getCalendarDayDisplay(day) }}
      </span>
    </template>
  </UCalendar>
</template>

<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'

defineProps<{
  hasLoggedEntryOnDay: (day: CalendarDate | { year: number, month: number, day: number }) => boolean
  getCalendarDayDisplay: (day: CalendarDate | { year: number, month: number, day: number }) => string
  getLoggedDaySeverityTitle: (day: CalendarDate | { year: number, month: number, day: number }) => string | undefined
}>()

const modelValue = defineModel<CalendarDate>({ required: true })
const placeholder = defineModel<CalendarDate>('placeholder', { required: true })
</script>
