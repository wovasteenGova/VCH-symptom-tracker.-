export const conditionImageAssets = {
  mentalHealth: '/image/ptsd-mental-health.png',
  backJointPain: '/image/back-joint-pain.png',
  nerveRadiculopathy: '/image/nerve-radiculopathy.png',
  migraineHeadache: '/image/migraine-headache.png',
  gerdIbs: '/image/gerd-ibs.png',
  sleepIssues: '/image/sleep-issues.png'
} as const

const categoryImageMap: Record<string, string> = {
  'Mental Health': conditionImageAssets.mentalHealth,
  Neurological: conditionImageAssets.migraineHeadache,
  Sleep: conditionImageAssets.sleepIssues,
  'Back, Neck, and Joint': conditionImageAssets.backJointPain,
  Nerve: conditionImageAssets.nerveRadiculopathy,
  Digestive: conditionImageAssets.gerdIbs
}

/** Best fallback when a category has no artwork in /public/image yet */
const defaultConditionImage = conditionImageAssets.mentalHealth

const conditionTitleImageOverrides: Record<string, string> = {
  'Sleep apnea': conditionImageAssets.sleepIssues
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

/** Search-list conditions whose category has no matching file in /public/image */
export const conditionsWithoutDedicatedImages = [
  { title: 'Asthma', category: 'Respiratory' },
  { title: 'Sleep apnea', category: 'Respiratory' },
  { title: 'Sinusitis', category: 'Respiratory' },
  { title: 'Rhinitis', category: 'Respiratory' },
  { title: 'Eczema', category: 'Skin' },
  { title: 'Psoriasis', category: 'Skin' },
  { title: 'Dermatitis', category: 'Skin' },
  { title: 'Fibromyalgia', category: 'Chronic Pain / Fatigue' },
  { title: 'Chronic fatigue', category: 'Chronic Pain / Fatigue' }
] as const

export const conditionImageCatalog = [
  { file: 'ptsd-mental-health.png', usedFor: ['Mental Health', 'PTSD', 'Anxiety', 'Depression', 'Panic attacks'] },
  { file: 'back-joint-pain.png', usedFor: ['Back, Neck, and Joint', 'Lower back pain', 'Neck pain', 'Knee conditions', 'Shoulder conditions', 'Arthritis'] },
  { file: 'nerve-radiculopathy.png', usedFor: ['Nerve', 'Radiculopathy', 'Sciatica', 'Peripheral neuropathy'] },
  { file: 'migraine-headache.png', usedFor: ['Neurological', 'Migraine', 'Tension headaches', 'Vertigo / Dizziness', 'Seizures'] },
  { file: 'gerd-ibs.png', usedFor: ['Digestive', 'GERD', 'IBS', 'Chronic diarrhea', 'Constipation'] },
  { file: 'sleep-issues.png', usedFor: ['Sleep', 'Insomnia / Sleep disturbances', 'Sleep apnea (fallback)'] }
] as const
