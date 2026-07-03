<template>

  <div class="flex h-full min-h-0 flex-col overflow-hidden">

    <div class="shrink-0 px-2 pt-2">

      <div class="flex items-start justify-between gap-3">

        <div class="min-w-0 flex-1">

          <p

            v-if="mode === 'onboarding'"

            class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"

          >

            Welcome

          </p>

          <h2

            class="text-2xl font-bold text-slate-950 dark:text-white"

            :class="mode === 'onboarding' ? 'mt-1' : ''"

          >

            {{ mode === 'onboarding' ? 'Pick your conditions' : 'All conditions' }}

          </h2>

          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">

            {{ mode === 'onboarding'

              ? (showProLimit

                ? 'Free includes 1 condition on your home screen. Upgrade to Pro for unlimited conditions.'

                : 'Choose what you want on your home screen. You can change these anytime.')

              : (showProLimit

                ? 'Free includes 1 active condition. Locked conditions require Pro.'

                : 'Tap to add or remove conditions from your home screen.') }}

          </p>

        </div>



        <button

          v-if="mode === 'manage'"

          type="button"

          class="shrink-0 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"

          @click="emit('done')"

        >

          Done

        </button>

      </div>



      <p class="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">

        {{ selectedCount }} picked

      </p>



      <p v-if="error" class="mt-2 text-sm font-medium text-red-600 dark:text-red-300">

        {{ error }}

      </p>



      <input

        v-model="searchQuery"

        type="search"

        placeholder="Search conditions"

        class="mt-3 w-full border-0 border-b border-slate-300/80 bg-transparent px-1 py-2.5 text-lg font-semibold text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-500 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"

      >

    </div>



    <div class="relative mt-3 min-h-0 flex-1">

      <div class="no-scrollbar h-full space-y-1 overflow-y-auto px-1 pb-24">

        <div

          v-if="showEmptyState"

          class="rounded-2xl px-3 py-8 text-center"

        >

          <p class="text-lg font-bold text-slate-950 dark:text-white">No matches</p>

          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">

            Try a different search term.

          </p>

        </div>



        <button

          v-for="condition in filteredConditions"

          :key="condition.key"

          type="button"

          class="flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left transition active:scale-[0.995]"

          :class="isLocked(condition.key)

            ? 'opacity-80 hover:bg-amber-50/80 dark:hover:bg-amber-950/20'

            : isSelected(condition.key)

              ? 'bg-slate-100 ring-1 ring-slate-300 hover:bg-slate-100 dark:bg-slate-800/90 dark:ring-slate-600 dark:hover:bg-slate-800/90'

              : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'"

          @click="handleConditionClick(condition.key)"

        >

          <img

            :src="condition.image"

            :alt="condition.title"

            class="size-16 shrink-0 rounded-2xl object-cover"

            :class="isLocked(condition.key) ? 'opacity-75' : ''"

          >



          <span class="min-w-0 flex-1">

            <span class="flex items-center gap-2">

              <span class="block text-lg font-bold leading-snug text-slate-950 dark:text-white">

                {{ condition.title }}

              </span>

            </span>

            <span class="mt-1 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">

              {{ condition.category }}

            </span>

            <span class="mt-1 block line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-300">

              {{ condition.description }}

            </span>

          </span>



          <span

            v-if="isLocked(condition.key)"

            class="flex shrink-0 flex-col items-center gap-1.5"

            aria-hidden="true"

          >

            <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-800 dark:bg-amber-950 dark:text-amber-200">

              Pro

            </span>

            <UIcon

              name="i-lucide-lock"

              class="size-4 text-amber-600 dark:text-amber-300"

            />

          </span>



          <span

            v-else

            class="grid size-10 shrink-0 place-items-center rounded-full transition duration-200"

            :class="isSelected(condition.key)

              ? 'bg-slate-950 text-white shadow-md shadow-slate-950/20 ring-2 ring-slate-950 dark:bg-white dark:text-slate-950 dark:ring-white'

              : 'bg-white text-transparent ring-2 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700'"

            aria-hidden="true"

          >

            <UIcon

              name="i-lucide-check"

              class="size-5 transition duration-200"

              :class="isSelected(condition.key) ? 'scale-100 opacity-100' : 'scale-75 opacity-0'"

            />

          </span>

        </button>

      </div>

    </div>



    <div

      v-if="mode === 'onboarding'"

      class="shrink-0 border-t border-slate-200 bg-white px-2 py-3 dark:border-slate-800 dark:bg-slate-950"

    >

      <button

        type="button"

        class="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-base font-bold text-white shadow-lg transition hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"

        :disabled="selectedCount === 0 || saving"

        @click="emit('confirm')"

      >

        {{ saving ? 'Saving...' : `Continue with ${selectedCount || 'your'} ${selectedCount === 1 ? 'condition' : 'conditions'}` }}

        <UIcon name="i-lucide-arrow-right" class="size-5" />

      </button>

    </div>

  </div>

</template>



<script setup lang="ts">

import { computed, ref, watch } from 'vue'

import { filterAndRankConditions } from '../utils/conditionSearch'



type ConditionOption = {

  key: string

  title: string

  category: string

  description: string

  image: string

}



const props = defineProps<{

  mode: 'onboarding' | 'manage'

  conditions: ConditionOption[]

  selectedKeys: string[]

  lockedKeys?: string[]

  showProLimit?: boolean

  saving?: boolean

  error?: string

}>()



const emit = defineEmits<{

  toggle: [key: string]

  lockedSelect: [key: string]

  confirm: []

  done: []

}>()



const searchQuery = ref('')

const debouncedSearchQuery = ref('')

let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined



watch(searchQuery, (value) => {

  if (searchDebounceTimer) {

    clearTimeout(searchDebounceTimer)

  }



  searchDebounceTimer = setTimeout(() => {

    debouncedSearchQuery.value = value

  }, 180)

}, { immediate: true })



const lockedKeySet = computed(() => new Set(props.lockedKeys || []))



const selectedCount = computed(() => props.selectedKeys.length)



const filteredConditions = computed(() => {
  const query = debouncedSearchQuery.value.trim()

  const results = filterAndRankConditions(props.conditions, query)

  const selectedOrder = new Map(props.selectedKeys.map((key, index) => [key, index]))
  const relevanceOrder = new Map(results.map((condition, index) => [condition.key, index]))

  return [...results].sort((a, b) => {
    const aSelected = selectedOrder.has(a.key)
    const bSelected = selectedOrder.has(b.key)

    if (aSelected && bSelected) {
      return (selectedOrder.get(a.key) ?? 0) - (selectedOrder.get(b.key) ?? 0)
    }

    if (aSelected) {
      return -1
    }

    if (bSelected) {
      return 1
    }

    return (relevanceOrder.get(a.key) ?? 0) - (relevanceOrder.get(b.key) ?? 0)
  })
})



const showEmptyState = computed(() => {

  return Boolean(debouncedSearchQuery.value.trim()) && filteredConditions.value.length === 0

})



function isSelected(key: string) {

  return props.selectedKeys.includes(key)

}



function isLocked(key: string) {

  return lockedKeySet.value.has(key)

}



function handleConditionClick(key: string) {

  if (isLocked(key)) {

    emit('lockedSelect', key)

    return

  }



  emit('toggle', key)

}

</script>


