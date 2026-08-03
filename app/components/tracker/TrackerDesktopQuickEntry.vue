<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { getSeverityGuidance, severityQuickPresets } from '../../utils/severityGuidance'
import { td } from '../../utils/trackerDesktopTheme'

const props = defineProps<{
  title: string
  image: string
  isEditing: boolean
  severity: number
  whatHappened: string
  dateTimePreview: string
  calendarDate: CalendarDate
  calendarPlaceholder: CalendarDate
  timeHour: number
  timeMinute: number
  timePeriod: 'AM' | 'PM'
  hasLoggedEntryOnDay: (day: CalendarDate | { year: number, month: number, day: number }) => boolean
  getCalendarDayDisplay: (day: CalendarDate | { year: number, month: number, day: number }) => string
  getLoggedDaySeverityTitle: (day: CalendarDate | { year: number, month: number, day: number }) => string | undefined
  isSaving: boolean
  error: string
}>()

defineEmits<{
  'update:severity': [value: number]
  'update:whatHappened': [value: string]
  'update:calendarDate': [value: unknown]
  'update:calendarPlaceholder': [value: unknown]
  'update:timeHour': [value: number]
  'update:timeMinute': [value: number]
  'update:timePeriod': [value: 'AM' | 'PM']
  timeChange: []
  setNow: []
  save: []
  cancel: []
}>()

const severityGuidance = computed(() => getSeverityGuidance(props.severity))
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
    <div class="mx-auto flex w-full max-w-xl min-h-0 flex-1 flex-col overflow-hidden px-5 py-4">
      <div class="mb-5 shrink-0 flex items-center gap-4">
        <img
          :src="image"
          :alt="title"
          class="size-14 shrink-0 rounded-2xl object-cover"
        >
        <div class="min-w-0 flex-1">
          <p :class="td.captionWide">
            {{ isEditing ? 'Edit entry' : 'New entry' }}
          </p>
          <h2 :class="['mt-1 truncate', td.titleXl]">
            {{ title }}
          </h2>
        </div>
        <button
          type="button"
          :class="td.ghostBtn"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
      </div>

      <div class="no-scrollbar min-h-0 flex-1 space-y-5 overflow-y-auto pb-4">
        <div :class="td.insetCard">
          <p :class="['mb-3', td.caption]">
            Severity today
          </p>
          <USlider
            :model-value="severity"
            :min="0"
            :max="10"
            :step="1"
            size="lg"
            color="primary"
            tooltip
            @update:model-value="$emit('update:severity', $event)"
          />
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="preset in severityQuickPresets"
              :key="preset.label"
              type="button"
              class="rounded-full border px-3 py-1.5 text-xs font-bold transition"
              :class="severity === preset.value
                ? 'border-primary bg-primary text-white'
                : 'border-default bg-elevated text-toned hover:bg-accented'"
              @click="$emit('update:severity', preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>
          <p class="mt-3 text-sm font-semibold text-highlighted">
            {{ severityGuidance.title }}
          </p>
          <p :class="['mt-1 text-xs leading-5', td.meta]">
            {{ severityGuidance.text }}
          </p>
        </div>

        <label class="block">
          <span :class="['mb-2 block', td.caption]">
            What happened?
          </span>
          <textarea
            :value="whatHappened"
            rows="5"
            placeholder="Describe symptoms, triggers, or changes today..."
            class="w-full resize-none rounded-2xl border border-default bg-muted/40 px-4 py-3 text-sm leading-6 text-highlighted outline-none placeholder:text-muted focus:border-primary/50"
            @input="$emit('update:whatHappened', ($event.target as HTMLTextAreaElement).value)"
          />
        </label>

        <div :class="td.insetCard">
          <div class="flex items-center justify-between gap-3">
            <span :class="td.caption">
              When
            </span>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-full border border-default bg-elevated px-3 py-1.5 text-xs font-bold text-highlighted shadow-sm transition hover:bg-accented"
              @click="$emit('setNow')"
            >
              <UIcon name="i-lucide-clock-3" class="size-3.5" />
              Now
            </button>
          </div>
          <p class="mt-2 text-sm font-medium text-highlighted">
            {{ dateTimePreview }}
          </p>

          <div class="mt-4 space-y-4">
            <SymptomCalendar
              :model-value="calendarDate"
              :placeholder="calendarPlaceholder"
              :has-logged-entry-on-day="hasLoggedEntryOnDay"
              :get-calendar-day-display="getCalendarDayDisplay"
              :get-logged-day-severity-title="getLoggedDaySeverityTitle"
              @update:model-value="$emit('update:calendarDate', $event)"
              @update:placeholder="$emit('update:calendarPlaceholder', $event)"
            />

            <TimeOfDayPicker
              :hour="timeHour"
              :minute="timeMinute"
              :period="timePeriod"
              @update:hour="$emit('update:timeHour', $event)"
              @update:minute="$emit('update:timeMinute', $event)"
              @update:period="$emit('update:timePeriod', $event)"
              @change="$emit('timeChange')"
            />
          </div>
        </div>
      </div>

      <div :class="td.dividerPt">
        <button
          type="button"
          :class="['w-full', td.primaryBtnBlock]"
          :disabled="isSaving"
          @click="$emit('save')"
        >
          {{ isSaving ? 'Saving...' : (isEditing ? 'Save changes' : 'Save entry') }}
          <UIcon name="i-lucide-check" class="size-5" />
        </button>
        <p v-if="error" class="mt-3 text-center text-sm font-medium text-error">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>
