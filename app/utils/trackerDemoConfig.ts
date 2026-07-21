import { conditionKeyFromLabel } from './subscription'

export type TrackerDemoScenario = {
  searchTerm: string
  conditionKey: string
  severity: number
  fieldSamples: Record<string, string>
}

export const trackerDemoTiming = {
  charSearchMs: 135,
  charFieldMs: 58,
  charPauseMs: 220,
  afterSearchMs: 1100,
  afterSelectMs: 1200,
  afterDoneMs: 1800,
  betweenStepsMs: 1400,
  betweenScenariosMs: 2600,
  loopPauseMs: 4200,
  startupMs: 2800,
  resetPauseMs: 2000,
  openBrowserMs: 1000,
  severityStepMs: 160,
  datetimePauseMs: 700,
  afterSubmitMs: 3400,
  afterHomeRevealMs: 2200,
  scrollDurationMs: 1400,
  scrollPauseMs: 900
} as const

export const trackerDemoFieldDefaults: Record<string, string> = {
  duration: '30 minutes',
  episode_duration: '45 minutes',
  functional_impact: 'Had to rest and missed part of the work day.',
  episode_type: 'Flashback with hypervigilance afterward.',
  symptoms_managed_by_medication: 'Partial relief after medication.',
  medications_for_this_entry: 'Sertraline 100mg daily',
  daily_impact: 'Harder to focus on routine tasks and family time.'
}

export const trackerDemoScenarios: TrackerDemoScenario[] = [
  {
    searchTerm: 'PTSD',
    conditionKey: conditionKeyFromLabel('PTSD'),
    severity: 7,
    fieldSamples: {
      symptoms_noticed: 'Nightmares, hypervigilance in crowds, irritability after loud noises.',
      safety_note: 'Used grounding techniques and stepped outside until symptoms eased.'
    }
  },
  {
    searchTerm: 'Migraine',
    conditionKey: conditionKeyFromLabel('Migraine'),
    severity: 8,
    fieldSamples: {
      headache_symptoms: 'Prostrating attack with light sensitivity and nausea for most of the morning.'
    }
  },
  {
    searchTerm: 'Lower back pain',
    conditionKey: conditionKeyFromLabel('Lower back pain'),
    severity: 6,
    fieldSamples: {
      joint_symptoms: 'Sharp lumbar pain after standing too long.',
      movement_limit: 'Could not bend to tie shoes without pausing.',
      flare_up_trigger: 'Long drive and cold weather.'
    }
  }
]
