export const conditionImageAssets = {
  mentalHealth: '/image/ptsd-mental-health.png',
  backJointPain: '/image/back-joint-pain.png',
  neckPain: '/image/neck-pain.png',
  nerveRadiculopathy: '/image/nerve-radiculopathy.png',
  migraineHeadache: '/image/migraine-headache.png',
  gerdIbs: '/image/gerd-ibs.png',
  sleepIssues: '/image/sleep-issues.png',
  asthma: '/image/asthma.png',
  sleepApnea: '/image/sleep-apnea.png',
  sinusitis: '/image/sinusitis.png',
  rhinitis: '/image/rhinitis.png',
  eczema: '/image/eczema.png',
  psoriasis: '/image/psoriasis.png',
  dermatitis: '/image/dermatitis.png',
  chronicPain: '/image/chronic-pain.png',
  fibromyalgia: '/image/fibromyalgia.png',
  chronicFatigue: '/image/chronic-fatigue.png',
  chronicFatigueCloseup: '/image/chronic-fatigue-closeup.png',
  chronicFatigueAlternate: '/image/chronic-fatigue-alternate.png'
} as const

const categoryImageMap: Record<string, string> = {
  'Mental Health': conditionImageAssets.mentalHealth,
  Neurological: conditionImageAssets.migraineHeadache,
  Sleep: conditionImageAssets.sleepIssues,
  'Back, Neck, and Joint': conditionImageAssets.backJointPain,
  Nerve: conditionImageAssets.nerveRadiculopathy,
  Digestive: conditionImageAssets.gerdIbs,
  Respiratory: conditionImageAssets.asthma,
  Skin: conditionImageAssets.eczema,
  'Chronic Pain / Fatigue': conditionImageAssets.chronicPain
}

/** Best fallback for custom conditions that do not match a category yet */
const defaultConditionImage = conditionImageAssets.mentalHealth

const conditionTitleImageOverrides: Record<string, string> = {
  Asthma: conditionImageAssets.asthma,
  'Neck pain': conditionImageAssets.neckPain,
  'Sleep apnea': conditionImageAssets.sleepApnea,
  Sinusitis: conditionImageAssets.sinusitis,
  Rhinitis: conditionImageAssets.rhinitis,
  Eczema: conditionImageAssets.eczema,
  Psoriasis: conditionImageAssets.psoriasis,
  Dermatitis: conditionImageAssets.dermatitis,
  Fibromyalgia: conditionImageAssets.fibromyalgia,
  'Chronic fatigue': conditionImageAssets.chronicFatigue
}

export const carouselConditions = [
  {
    title: 'PTSD / Mental Health',
    image: conditionImageAssets.mentalHealth
  },
  {
    title: 'Back or Joint Pain',
    image: conditionImageAssets.backJointPain
  },
  {
    title: 'Nerve / Radiculopathy',
    image: conditionImageAssets.nerveRadiculopathy
  },
  {
    title: 'Migraine / Headache',
    image: conditionImageAssets.migraineHeadache
  },
  {
    title: 'GERD / IBS',
    image: conditionImageAssets.gerdIbs
  },
  {
    title: 'Sleep Issues',
    image: conditionImageAssets.sleepIssues
  }
] as const

export function getConditionImage(title: string, category: string) {
  return conditionTitleImageOverrides[title]
    ?? categoryImageMap[category]
    ?? defaultConditionImage
}

export function hasDedicatedCategoryImage(category: string) {
  return Boolean(categoryImageMap[category])
}

export const conditionsWithoutDedicatedImages = [] as const

export const conditionImageCatalog = [
  { file: 'ptsd-mental-health.png', usedFor: ['Mental Health', 'PTSD', 'Anxiety', 'Depression', 'Panic attacks'] },
  { file: 'back-joint-pain.png', usedFor: ['Back, Neck, and Joint fallback', 'Lower back pain', 'Knee conditions', 'Shoulder conditions', 'Arthritis'] },
  { file: 'neck-pain.png', usedFor: ['Neck pain'] },
  { file: 'nerve-radiculopathy.png', usedFor: ['Nerve', 'Radiculopathy', 'Sciatica', 'Peripheral neuropathy'] },
  { file: 'migraine-headache.png', usedFor: ['Neurological', 'Migraine', 'Tension headaches', 'Vertigo / Dizziness', 'Seizures'] },
  { file: 'gerd-ibs.png', usedFor: ['Digestive', 'GERD', 'IBS', 'Chronic diarrhea', 'Constipation'] },
  { file: 'sleep-issues.png', usedFor: ['Sleep', 'Insomnia / Sleep disturbances'] },
  { file: 'asthma.png', usedFor: ['Asthma', 'Respiratory fallback'] },
  { file: 'sleep-apnea.png', usedFor: ['Sleep apnea'] },
  { file: 'sinusitis.png', usedFor: ['Sinusitis'] },
  { file: 'rhinitis.png', usedFor: ['Rhinitis'] },
  { file: 'eczema.png', usedFor: ['Eczema', 'Skin fallback'] },
  { file: 'psoriasis.png', usedFor: ['Psoriasis'] },
  { file: 'dermatitis.png', usedFor: ['Dermatitis'] },
  { file: 'chronic-pain.png', usedFor: ['Chronic Pain / Fatigue fallback'] },
  { file: 'fibromyalgia.png', usedFor: ['Fibromyalgia'] },
  { file: 'chronic-fatigue.png', usedFor: ['Chronic fatigue'] },
  { file: 'chronic-fatigue-closeup.png', usedFor: ['Available chronic fatigue close-up variant, not currently assigned'] },
  { file: 'chronic-fatigue-alternate.png', usedFor: ['Available chronic fatigue alternate illustration, not currently assigned'] }
] as const
