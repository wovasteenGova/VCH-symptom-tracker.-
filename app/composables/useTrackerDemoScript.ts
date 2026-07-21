import { onBeforeUnmount, onMounted } from 'vue'
import { trackerDemoScenarios, trackerDemoTiming } from '../utils/trackerDemoConfig'
import type { useTrackerDemoMode } from './useTrackerDemoMode'

export type TrackerDemoActions = {
  ready: { value: boolean }
  resetPreview: () => Promise<void>
  openConditionBrowser: () => void
  setConditionSearch: (text: string) => void
  selectCondition: (key: string) => Promise<void>
  finishConditionBrowser: () => Promise<void>
  openEntryForConditionKey: (key: string) => void
  fillCurrentEntryStep: (samples: Record<string, string>, severity: number) => Promise<void>
  advanceEntryStep: () => boolean
  submitDemoEntry: () => Promise<void>
  revealSavedConditionOnHome: (conditionKey: string) => Promise<void>
  collapseHistoryForDemo: () => void
  isConditionBrowserVisible: () => boolean
  isEntryOpen: () => boolean
}

type DemoMode = ReturnType<typeof useTrackerDemoMode>

function sleep(ms: number, mode: DemoMode) {
  return new Promise<void>((resolve) => {
    const started = Date.now()

    const tick = () => {
      if (mode.isUserControlled.value) {
        resolve()
        return
      }

      if (mode.isPaused.value) {
        setTimeout(tick, 100)
        return
      }

      const elapsed = Date.now() - started
      if (elapsed >= ms) {
        resolve()
        return
      }

      setTimeout(tick, Math.min(100, ms - elapsed))
    }

    tick()
  })
}

async function typeSearchTerm(text: string, actions: TrackerDemoActions, mode: DemoMode) {
  actions.setConditionSearch('')

  let typed = ''
  for (const char of text) {
    if (mode.isUserControlled.value) {
      return
    }

    typed += char
    actions.setConditionSearch(typed)
    await sleep(trackerDemoTiming.charSearchMs, mode)

    if (char === ' ' || char === ',') {
      await sleep(trackerDemoTiming.charPauseMs, mode)
    }
  }
}

async function runScenario(
  scenario: (typeof trackerDemoScenarios)[number],
  actions: TrackerDemoActions,
  mode: DemoMode
) {
  if (mode.isUserControlled.value) {
    return
  }

  actions.collapseHistoryForDemo()
  await sleep(900, mode)

  if (!actions.isConditionBrowserVisible()) {
    actions.openConditionBrowser()
    await sleep(trackerDemoTiming.openBrowserMs, mode)
  }

  await typeSearchTerm(scenario.searchTerm, actions, mode)
  await sleep(trackerDemoTiming.afterSearchMs, mode)

  await actions.selectCondition(scenario.conditionKey)
  await sleep(trackerDemoTiming.afterSelectMs, mode)

  await actions.finishConditionBrowser()
  await sleep(trackerDemoTiming.afterDoneMs, mode)

  actions.openEntryForConditionKey(scenario.conditionKey)
  await sleep(trackerDemoTiming.openBrowserMs, mode)

  let guard = 0
  while (actions.isEntryOpen() && guard < 24) {
    if (mode.isUserControlled.value) {
      return
    }

    await actions.fillCurrentEntryStep(scenario.fieldSamples, scenario.severity)
    await sleep(trackerDemoTiming.betweenStepsMs, mode)

    const finished = actions.advanceEntryStep()
    if (finished) {
      await actions.submitDemoEntry()
      await sleep(trackerDemoTiming.afterSubmitMs, mode)
      await actions.revealSavedConditionOnHome(scenario.conditionKey)
      await sleep(trackerDemoTiming.afterHomeRevealMs, mode)
      break
    }

    guard += 1
  }

  await sleep(trackerDemoTiming.betweenScenariosMs, mode)
}

export function useTrackerDemoScript(
  actions: TrackerDemoActions | null,
  mode: DemoMode | null
) {
  let loopTimer: ReturnType<typeof setTimeout> | undefined
  let cancelled = false

  async function runLoop(activeActions: TrackerDemoActions, activeMode: DemoMode) {
    if (cancelled || activeMode.isUserControlled.value) {
      return
    }

    await activeActions.resetPreview()
    await sleep(trackerDemoTiming.resetPauseMs, activeMode)

    for (const scenario of trackerDemoScenarios) {
      if (cancelled || activeMode.isUserControlled.value) {
        return
      }

      await runScenario(scenario, activeActions, activeMode)
    }

    if (!cancelled && !activeMode.isUserControlled.value) {
      loopTimer = setTimeout(() => {
        void runLoop(activeActions, activeMode)
      }, trackerDemoTiming.loopPauseMs)
    }
  }

  onMounted(() => {
    if (!actions || !mode) {
      return
    }

    loopTimer = setTimeout(() => {
      void runLoop(actions, mode)
    }, trackerDemoTiming.startupMs)
  })

  onBeforeUnmount(() => {
    cancelled = true
    if (loopTimer) {
      clearTimeout(loopTimer)
    }
  })
}
