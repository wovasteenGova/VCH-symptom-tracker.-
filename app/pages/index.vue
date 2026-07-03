<template>
  <main class="flex min-h-screen flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
    <div class="flex flex-1 items-center">
      <div class="mx-auto w-full max-w-4xl px-6 py-12 lg:py-20">
        <div class="flex flex-col gap-8">
          <div class="flex items-center gap-4">
            <div class="size-20 shrink-0 overflow-hidden rounded-[1.25rem] shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 sm:size-24 sm:rounded-[1.5rem]">
              <img
                :src="reportBranding.logoPath"
                alt="Veterans Central Hub"
                class="size-full object-cover object-center"
              >
            </div>
            <div>
              <p class="text-3xl font-bold tracking-[0.14em] sm:text-4xl">
                VCH
              </p>
              <p class="mt-1 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
                VCH Symptom Tracker is a VCH tool.
              </p>
            </div>
          </div>

          <div class="space-y-4">
            <UBadge color="primary" variant="soft" size="lg">
              Live · Free to start
            </UBadge>
            <h1 class="text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl lg:leading-tight">
              Log symptoms on your phone. Build claim evidence over time.
            </h1>
            <p class="max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 lg:text-lg">
              A mobile-first tracker for veterans — built separately from the main VCH site so your health
              logs stay focused, private, and easy to use day to day.
            </p>
          </div>

          <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 shadow-2xl dark:border-slate-800">
            <img
              :src="trackerPreviewImage"
              alt="VCH Symptom Tracker home screen"
              class="w-full object-cover object-top"
              loading="eager"
              decoding="async"
            >
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <UButton
              to="/app"
              color="primary"
              size="xl"
              trailing-icon="i-lucide-arrow-right"
            >
              Open Symptom Tracker
            </UButton>
            <UButton
              :href="VCH_HUB_URL"
              external
              target="_blank"
              color="neutral"
              variant="outline"
              size="xl"
            >
              Visit Veterans Central Hub
            </UButton>
          </div>

          <TrackerOpenQrCode
            :url="trackerAppUrl"
            class="max-w-md"
          />
        </div>
      </div>
    </div>

    <section class="border-t border-slate-200 bg-white/90 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/90">
      <div class="mx-auto max-w-4xl px-6 py-10 lg:py-14">
        <h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
          What the Symptom Tracker does
        </h2>
        <p class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300 lg:text-lg">
          Track flare-ups, severity, daily impact, and mental health symptoms in one place. Add family
          observations when you need them, review your history on a calendar, and export signed PDF reports
          for C&amp;P exams, personal statements, SHA, and your own records. Strong evidence starts before
          you file — not after.
        </p>

        <ul class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="item in highlights"
            :key="item.title"
            class="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60"
          >
            <div class="mb-3 inline-flex rounded-xl bg-sky-500/10 p-2.5 text-sky-600 dark:text-sky-300">
              <UIcon :name="item.icon" class="size-5" />
            </div>
            <p class="font-semibold text-slate-950 dark:text-white">
              {{ item.title }}
            </p>
            <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {{ item.copy }}
            </p>
          </li>
        </ul>

        <div class="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <p class="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            VCH Symptom Tracker is for personal recordkeeping — not medical advice, legal advice, or an
            emergency line. In crisis, call 988 and press 1.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row sm:shrink-0">
            <UButton
              to="/app"
              color="primary"
              size="lg"
            >
              Use now
            </UButton>
            <UButton
              :href="`${VCH_HUB_URL}/symptom-tracker`"
              external
              target="_blank"
              color="neutral"
              variant="ghost"
              size="lg"
            >
              Learn more on VCH
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { reportBranding, resolveTrackerAppUrl } from '../utils/reportBranding'
import { VCH_HUB_URL } from '../utils/subscription'

const config = useRuntimeConfig()

const trackerAppUrl = computed(() => resolveTrackerAppUrl(config.public.siteUrl))
const trackerPreviewImage = 'https://ik.imagekit.io/i4urmqzd19/VCH_tracker/tracker_home.png?updatedAt=1783102472893'

const isDesktopLayout = useMediaQuery('(min-width: 768px)')

onMounted(() => {
  if (!isDesktopLayout.value) {
    navigateTo('/app', { replace: true })
  }
})

const highlights = [
  {
    title: 'Track by condition',
    copy: 'Pick the conditions that matter to you and log episodes, severity, and impact as they happen.',
    icon: 'i-lucide-activity'
  },
  {
    title: 'Family observations',
    copy: 'Share a private link so a spouse or supporter can add what they noticed — on Pro.',
    icon: 'i-lucide-users'
  },
  {
    title: 'Export PDF reports',
    copy: 'Download signed symptom logs when you need records for exams, statements, or your VSO.',
    icon: 'i-lucide-file-text'
  }
]

useHead({
  title: 'VCH Symptom Tracker',
  meta: [
    {
      name: 'description',
      content: 'VCH Symptom Tracker — a Veterans Central Hub tool for logging symptoms, daily impact, and exporting PDF evidence for VA claims.'
    }
  ]
})
</script>
