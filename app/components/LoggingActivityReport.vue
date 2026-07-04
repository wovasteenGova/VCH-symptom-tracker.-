<template>
  <section class="mt-5 rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/70">
    <div class="flex items-start gap-3">
      <div class="grid size-10 shrink-0 place-items-center rounded-2xl bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-300">
        <UIcon name="i-lucide-bar-chart-3" class="size-5" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Monthly breakdown
        </p>
        <p class="mt-1 text-base font-bold text-slate-950 dark:text-white">
          {{ metrics.monthLabel }}
        </p>
        <p class="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
          {{ summaryText }}
        </p>
        <p class="mt-1 text-[0.65rem] leading-5 text-slate-500 dark:text-slate-400">
          Changes when you swipe to another month on the calendar above.
        </p>
      </div>
    </div>

    <div v-if="metrics.totalLogs" class="mt-5 space-y-5">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Logs each week
        </p>
        <p class="mt-1 text-[0.65rem] leading-5 text-slate-500 dark:text-slate-400">
          In {{ metrics.monthLabel }} only
        </p>
        <ul class="mt-3 space-y-2.5">
          <li
            v-for="week in metrics.weeklyBreakdown"
            :key="week.label"
            class="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3"
          >
            <span class="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
              {{ week.label }}
            </span>
            <div class="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-sky-500 transition-all duration-500 dark:bg-sky-400"
                :style="{ width: `${barWidth(week.count, maxWeeklyCount)}%` }"
              />
            </div>
            <span class="min-w-[3.25rem] text-right text-xs tabular-nums">
              <span class="font-bold text-slate-950 dark:text-white">{{ week.count }}</span>
              <span class="font-semibold text-slate-400 dark:text-slate-500">{{ logCountSuffix(week.count) }}</span>
            </span>
          </li>
        </ul>
      </div>

      <div>
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Logs per condition
        </p>
        <p class="mt-1 text-[0.65rem] leading-5 text-slate-500 dark:text-slate-400">
          In {{ metrics.monthLabel }} only · each saved entry counts (including more than one on the same day)
        </p>
        <ul class="mt-3 space-y-2.5">
          <li
            v-for="condition in metrics.conditionBreakdown"
            :key="condition.label"
            class="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3"
          >
            <span class="truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
              {{ condition.label }}
            </span>
            <div class="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                class="h-full rounded-full bg-emerald-500 transition-all duration-500 dark:bg-emerald-400"
                :style="{ width: `${barWidth(condition.count, maxConditionCount)}%` }"
              />
            </div>
            <span class="min-w-[3.25rem] text-right text-xs tabular-nums">
              <span class="font-bold text-slate-950 dark:text-white">{{ condition.count }}</span>
              <span class="font-semibold text-slate-400 dark:text-slate-500">{{ logCountSuffix(condition.count) }}</span>
            </span>
          </li>
        </ul>
        <p
          v-if="metrics.extraConditionCount"
          class="mt-2 text-xs text-slate-500 dark:text-slate-400"
        >
          +{{ metrics.extraConditionCount }} more condition{{ metrics.extraConditionCount === 1 ? '' : 's' }} this month
        </p>
      </div>

      <div>
        <p class="text-xs font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
          Daily logging consistency
        </p>
        <p class="mt-1 text-[0.65rem] leading-5 text-slate-500 dark:text-slate-400">
          {{ metrics.monthLabel }} · days you saved at least one log
        </p>
        <div class="mt-3 grid grid-cols-7 gap-1.5 text-center text-[0.65rem] font-semibold text-slate-400">
          <span v-for="day in weekDays" :key="day">{{ day }}</span>
        </div>
        <div class="mt-2 grid grid-cols-7 gap-1.5">
          <span
            v-for="cell in calendarCells"
            :key="cell.key"
            class="grid aspect-square place-items-center rounded-lg text-[0.65rem] font-bold"
            :class="cell.className"
          >
            {{ cell.label }}
          </span>
        </div>
      </div>
    </div>

    <p
      v-else
      class="mt-4 rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs leading-5 text-slate-500 dark:border-slate-700 dark:text-slate-400"
    >
      Log symptoms on the calendar days above and this report will fill in automatically.
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  formatLoggingActivitySummary,
  type LoggingActivityMetrics
} from '../utils/loggingActivityReport'

const props = defineProps<{
  metrics: LoggingActivityMetrics
}>()

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const summaryText = computed(() => formatLoggingActivitySummary(props.metrics))

const maxWeeklyCount = computed(() => {
  return Math.max(...props.metrics.weeklyBreakdown.map((week) => week.count), 1)
})

const maxConditionCount = computed(() => {
  return Math.max(...props.metrics.conditionBreakdown.map((condition) => condition.count), 1)
})

function barWidth(value: number, maxValue: number) {
  if (!value) {
    return 0
  }

  return Math.max(10, Math.round((value / maxValue) * 100))
}

function logCountSuffix(count: number) {
  return count === 1 ? ' log' : ' logs'
}

function densityClass(count: number) {
  if (!count) {
    return 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
  }

  if (count >= 3) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200'
  }

  if (count >= 2) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
  }

  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
}

const calendarCells = computed(() => {
  const cells: Array<{ key: string, label: string, className: string }> = []

  for (let index = 0; index < props.metrics.mondayOffset; index += 1) {
    cells.push({
      key: `empty-${index}`,
      label: '',
      className: 'bg-transparent'
    })
  }

  props.metrics.dailyCounts.forEach((count, index) => {
    cells.push({
      key: `day-${index + 1}`,
      label: count > 0 ? String(count) : String(index + 1),
      className: densityClass(count)
    })
  })

  return cells
})
</script>
