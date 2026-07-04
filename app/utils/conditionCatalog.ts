import { getConditionImage } from './conditionImages'
import { conditionKeyFromLabel } from './subscription'

export type ConditionCatalogEntry = {
  title: string
  category: string
  description: string
  vaFocus: readonly string[]
  tip: string
}

export const EFFECTIVE_DATE_TIP =
  'If you\'re nearing an important filing deadline or effective date, consider filing your claim first. Additional evidence and symptom logs can be submitted later.'

export const VA_MENTAL_HEALTH_COMBINED_TIP =
  'The VA evaluates mental health as one combined rating. Log any mental health symptoms you have, even if you do not think they belong to your diagnosis. Anxiety, depression, panic, nightmares, and sleep issues all count.'

export const VA_MENTAL_HEALTH_SEVERITY_TIP =
  'Severity is about impact, not toughness. Log what happened under episode type or symptoms noticed. Your 0-10 score should reflect how the day actually went: work, sleep, relationships, and safety. You are not picking a diagnosis. You are building an honest timeline.'

export const VA_MENTAL_HEALTH_WORST_DAY_TIP =
  'Worst days often look like this: could not leave the house, panic most of the day, no sleep, or thoughts of not wanting to be here. If it happened, log it. Many veterans minimize symptoms that raters still treat as significant.'

export const VA_MENTAL_HEALTH_CRISIS_TIP =
  'In crisis right now? Call 988 and press 1, text 838255, or visit veteranscrisisline.net. This tracker is for your records, not an emergency line. Passive or brief suicidal thoughts are still worth logging when you are safe.'

export const VA_CRISIS_LINE_SHORT =
  'In crisis? Call 988 and press 1, text 838255, or visit veteranscrisisline.net.'

export const HOME_HONESTY_TIP = {
  title: 'Honestly is a virtue',
  text: 'Log what actually happened—not what you think you should report. Honest entries help you see your real patterns and give raters a timeline they can trust. This is your record, not a performance.'
} as const

const mentalHealthFocus = [
  'How often symptoms happen and how severe they are',
  'Work, relationship, and daily-life impact',
  'Nightmares, flashbacks, panic, avoidance, or irritability when they apply'
] as const

const mentalHealthTip = (title: string) => {
  if (title === 'PTSD') {
    return 'Don\'t feel bad about asking loved ones to help document what they see. Family members often notice changes we overlook ourselves, and most want to help you heal, not see you struggle alone.'
  }

  if (title === 'Panic attacks') {
    return 'Log episodes as soon as you can while the physical symptoms are fresh: racing heart, shortness of breath, fear, and how long it took to recover.'
  }

  if (title === 'Mental Health') {
    return VA_MENTAL_HEALTH_COMBINED_TIP
  }

  return 'Write down what happened, how long it lasted, and what you could not do afterward. Patterns over time matter more than one perfect entry.'
}

const neurologicalFocus = [
  'Episode frequency, duration, and severity',
  'Prostrating attacks or needing to stop activity',
  'Nausea, light sensitivity, vertigo, or missed work when they apply'
] as const

const neurologicalTip = (title: string) => {
  if (title === 'Migraine') {
    return 'Try logging symptoms as soon as possible after an episode. Small details like nausea, needing a dark room, or missing work are easy to forget.'
  }

  if (title === 'Seizures') {
    return 'Note what happened before and after the episode, any injury, witnesses, and how long recovery took. Those details are easy to lose if you wait.'
  }

  return 'Capture the episode while it is still fresh—duration, triggers, and whether you had to lie down or miss plans.'
}

const musculoskeletalFocus = [
  'Pain severity and flare frequency',
  'Limits on sitting, standing, walking, bending, or lifting',
  'Missed work, sleep loss, or canceled plans because of pain'
] as const

const musculoskeletalTip =
  'Describe what you could not do—not just how much it hurt. The VA weighs functional loss heavily for joint and back claims.'

const nerveFocus = [
  'Side affected and type of nerve symptoms',
  'Numbness, tingling, burning, weakness, or falls',
  'How symptoms limit sitting, walking, or daily tasks'
] as const

const nerveTip =
  'Be specific about left vs. right and whether symptoms radiate down an arm or leg. That detail helps tie logs to your diagnosis.'

const digestiveFocus = [
  'Bowel urgency, diarrhea, constipation, abdominal pain, reflux, or nausea',
  'Food, medication, or bathroom-urgency triggers when you know them',
  'Sleep interruption, missed meals, avoided travel, or interrupted activities'
] as const

const digestiveTip =
  'Bowel and stomach flares are easy to forget once the urgency passes. A quick log after eating, waking up, or needing the bathroom helps a lot.'

const sleepFocus = [
  'Hours slept and how often you woke up',
  'Nightmares, pain, breathing issues, or panic that broke sleep',
  'Next-day fatigue, focus problems, or missed activity'
] as const

const sleepTip =
  'Log the next morning while you still remember wake-ups, nightmares, and how useless the sleep felt.'

const respiratoryFocus = [
  'Shortness of breath, wheezing, cough, or congestion',
  'Rescue inhaler, CPAP/BiPAP, or other treatment used',
  'Triggers such as exercise, weather, sleep, or stairs'
] as const

const respiratoryTip =
  'Note when you needed rescue treatment and what you had to stop doing. Frequency and functional impact matter.'

const skinFocus = [
  'Itching, burning, open areas, or flare severity',
  'Body areas affected and how much skin is involved',
  'Sleep loss, treatment used, and activity limits'
] as const

const skinTip =
  'Itching that steals sleep is worth mentioning every time. That functional impact is something raters look for.'

const chronicPainFocus = [
  'Pain, fatigue, brain fog, and flare severity',
  'Useful function that day—work, chores, driving, self-care',
  'What worsened symptoms such as sleep, stress, or overdoing it'
] as const

const chronicPainTip =
  'On low-function days, write what you had to skip—not only how bad you felt. That shows real-world impact.'

export const conditionCatalogDefinitions: ConditionCatalogEntry[] = [
  {
    title: 'Mental Health',
    category: 'Mental Health',
    description: 'All mental health symptoms: anxiety, depression, panic, nightmares, and daily impact in one log.',
    vaFocus: mentalHealthFocus,
    tip: mentalHealthTip('Mental Health')
  },
  {
    title: 'Lower back pain',
    category: 'Back, Neck, and Joint',
    description: 'Pain level, flare-ups, limits sitting, standing, walking, and lifting.',
    vaFocus: musculoskeletalFocus,
    tip: musculoskeletalTip
  },
  {
    title: 'PTSD',
    category: 'Mental Health',
    description: 'Nightmares, flashbacks, panic, isolation, irritability, and missed work.',
    vaFocus: mentalHealthFocus,
    tip: mentalHealthTip('PTSD')
  },
  {
    title: 'Migraine',
    category: 'Neurological',
    description: 'Frequency, duration, severity, triggers, and daily impact.',
    vaFocus: neurologicalFocus,
    tip: neurologicalTip('Migraine')
  },
  {
    title: 'Tension headaches',
    category: 'Neurological',
    description: 'Headache pattern, pain level, work impact, and medication use.',
    vaFocus: neurologicalFocus,
    tip: neurologicalTip('Tension headaches')
  },
  {
    title: 'Anxiety',
    category: 'Mental Health',
    description: 'Triggers, panic symptoms, avoidance, sleep, and social impact.',
    vaFocus: mentalHealthFocus,
    tip: mentalHealthTip('Anxiety')
  },
  {
    title: 'Neck pain',
    category: 'Back, Neck, and Joint',
    description: 'Range of motion, flare-ups, pain level, and activity limits.',
    vaFocus: musculoskeletalFocus,
    tip: musculoskeletalTip
  },
  {
    title: 'Depression',
    category: 'Mental Health',
    description: 'Mood, motivation, hygiene, isolation, sleep, and daily functioning.',
    vaFocus: mentalHealthFocus,
    tip: mentalHealthTip('Depression')
  },
  {
    title: 'Knee conditions',
    category: 'Back, Neck, and Joint',
    description: 'Pain, swelling, instability, walking limits, stairs, and missed activity.',
    vaFocus: musculoskeletalFocus,
    tip: musculoskeletalTip
  },
  {
    title: 'Panic attacks',
    category: 'Mental Health',
    description: 'Immediate episode logs for panic symptoms, duration, and recovery.',
    vaFocus: mentalHealthFocus,
    tip: mentalHealthTip('Panic attacks')
  },
  {
    title: 'Vertigo / Dizziness',
    category: 'Neurological',
    description: 'Dizzy spells, falls, nausea, balance issues, and missed activity.',
    vaFocus: neurologicalFocus,
    tip: neurologicalTip('Vertigo / Dizziness')
  },
  {
    title: 'Seizures',
    category: 'Neurological',
    description: 'Episode timing, recovery, injuries, witnesses, and daily impact.',
    vaFocus: neurologicalFocus,
    tip: neurologicalTip('Seizures')
  },
  {
    title: 'Insomnia / Sleep disturbances',
    category: 'Sleep',
    description: 'Hours slept, wake-ups, nightmares, fatigue, and next-day effects.',
    vaFocus: sleepFocus,
    tip: sleepTip
  },
  {
    title: 'Shoulder conditions',
    category: 'Back, Neck, and Joint',
    description: 'Pain, range of motion, lifting limits, sleep interruption, and flare-ups.',
    vaFocus: musculoskeletalFocus,
    tip: musculoskeletalTip
  },
  {
    title: 'Arthritis',
    category: 'Back, Neck, and Joint',
    description: 'Joint pain, stiffness, flare-ups, movement limits, and medication use.',
    vaFocus: musculoskeletalFocus,
    tip: musculoskeletalTip
  },
  {
    title: 'Radiculopathy',
    category: 'Nerve',
    description: 'Left/right symptoms, numbness, tingling, burning, weakness, and falls.',
    vaFocus: nerveFocus,
    tip: nerveTip
  },
  {
    title: 'Sciatica',
    category: 'Nerve',
    description: 'Radiating pain, leg weakness, numbness, sitting limits, and flare-ups.',
    vaFocus: nerveFocus,
    tip: nerveTip
  },
  {
    title: 'Peripheral neuropathy',
    category: 'Nerve',
    description: 'Numbness, tingling, burning, weakness, walking issues, and falls.',
    vaFocus: nerveFocus,
    tip: nerveTip
  },
  {
    title: 'IBS / Bowel Symptoms',
    category: 'Digestive',
    description: 'Bowel and stomach symptoms: abdominal pain, urgency, diarrhea, constipation, reflux, medication, and triggers.',
    vaFocus: digestiveFocus,
    tip: digestiveTip
  },
  {
    title: 'Asthma',
    category: 'Respiratory',
    description: 'Shortness of breath, rescue inhaler use, attacks, and triggers.',
    vaFocus: respiratoryFocus,
    tip: respiratoryTip
  },
  {
    title: 'Sleep apnea',
    category: 'Respiratory',
    description: 'Sleep problems, fatigue, CPAP use, headaches, and daytime impact.',
    vaFocus: [...respiratoryFocus.slice(0, 2), 'Daytime fatigue, headaches, and CPAP or BiPAP compliance'],
    tip: 'If CPAP helps—or you skipped it and felt worse—note that. Compliance and daytime function both matter for sleep apnea claims.'
  },
  {
    title: 'Sinusitis',
    category: 'Respiratory',
    description: 'Congestion, headaches, flare-ups, infections, medication, and missed activity.',
    vaFocus: respiratoryFocus,
    tip: respiratoryTip
  },
  {
    title: 'Rhinitis',
    category: 'Respiratory',
    description: 'Congestion, runny nose, sneezing, breathing issues, and triggers.',
    vaFocus: respiratoryFocus,
    tip: respiratoryTip
  },
  {
    title: 'Eczema',
    category: 'Skin',
    description: 'Area affected, itching, flare-ups, treatment, and photos later.',
    vaFocus: skinFocus,
    tip: skinTip
  },
  {
    title: 'Psoriasis',
    category: 'Skin',
    description: 'Area affected, plaques, itching, flare-ups, treatment, and photos later.',
    vaFocus: skinFocus,
    tip: skinTip
  },
  {
    title: 'Dermatitis',
    category: 'Skin',
    description: 'Rash location, itching, triggers, flare-ups, treatment, and photos later.',
    vaFocus: skinFocus,
    tip: skinTip
  },
  {
    title: 'Fibromyalgia',
    category: 'Chronic Pain / Fatigue',
    description: 'Pain, fatigue, brain fog, flare-ups, and days unable to function normally.',
    vaFocus: chronicPainFocus,
    tip: chronicPainTip
  },
  {
    title: 'Chronic fatigue',
    category: 'Chronic Pain / Fatigue',
    description: 'Fatigue level, brain fog, rest needs, and functional limitations.',
    vaFocus: chronicPainFocus,
    tip: chronicPainTip
  }
]

export type ConditionCatalogItem = ConditionCatalogEntry & {
  key: string
  image: string
}

export const conditionCatalog = conditionCatalogDefinitions.map((condition) => ({
  ...condition,
  key: conditionKeyFromLabel(condition.title),
  image: getConditionImage(condition.title, condition.category)
}))

export function getCatalogConditionByKey(key: string) {
  return conditionCatalog.find((condition) => condition.key === key) || null
}

const conditionKeyAliases: Record<string, string> = {
  [conditionKeyFromLabel('GERD')]: conditionKeyFromLabel('IBS / Bowel Symptoms'),
  [conditionKeyFromLabel('IBS')]: conditionKeyFromLabel('IBS / Bowel Symptoms'),
  [conditionKeyFromLabel('GERD / IBS')]: conditionKeyFromLabel('IBS / Bowel Symptoms'),
  [conditionKeyFromLabel('Chronic diarrhea')]: conditionKeyFromLabel('IBS / Bowel Symptoms'),
  [conditionKeyFromLabel('Constipation')]: conditionKeyFromLabel('IBS / Bowel Symptoms')
}

export function resolveCatalogConditionByStoredKey(storedKey: string): ConditionCatalogItem | null {
  const trimmedKey = storedKey?.trim()
  if (!trimmedKey) {
    return null
  }

  const directMatch = getCatalogConditionByKey(trimmedKey)
  if (directMatch) {
    return directMatch
  }

  const normalizedKey = conditionKeyFromLabel(trimmedKey)
  const aliasedKey = conditionKeyAliases[normalizedKey]
  if (aliasedKey) {
    const aliasMatch = getCatalogConditionByKey(aliasedKey)
    if (aliasMatch) {
      return aliasMatch
    }
  }

  const normalizedMatch = getCatalogConditionByKey(normalizedKey)
  if (normalizedMatch) {
    return normalizedMatch
  }

  return conditionCatalog.find((condition) => {
    return condition.title.toLowerCase() === trimmedKey.toLowerCase()
      || conditionKeyFromLabel(condition.title) === normalizedKey
  }) || null
}

export function normalizeTrackedConditionKeys(keys: string[]) {
  return [...new Set(keys
    .map((storedKey) => resolveCatalogConditionByStoredKey(storedKey)?.key || null)
    .filter(Boolean) as string[])]
}

export function normalizeConditionLabel(label: string | null | undefined) {
  const trimmedLabel = label?.trim()

  if (!trimmedLabel) {
    return 'Untitled condition'
  }

  const normalizedKey = conditionKeyFromLabel(trimmedLabel)
  const aliasedKey = conditionKeyAliases[normalizedKey]

  if (aliasedKey) {
    return getCatalogConditionByKey(aliasedKey)?.title || trimmedLabel
  }

  return trimmedLabel
}

export function pickRandomHomeVisitTip(conditions: ConditionCatalogItem[]): { title: string, text: string } | null {
  const pool = conditions.map((condition) => ({
    title: `${condition.title} tip`,
    text: condition.tip
  }))

  pool.push({
    title: 'Effective date tip',
    text: EFFECTIVE_DATE_TIP
  })

  pool.push({
    title: 'Mental health tip',
    text: VA_MENTAL_HEALTH_COMBINED_TIP
  })

  pool.push({
    title: 'Severity tip',
    text: VA_MENTAL_HEALTH_SEVERITY_TIP
  })

  pool.push({
    title: 'Worst day tip',
    text: VA_MENTAL_HEALTH_WORST_DAY_TIP
  })

  pool.push({
    title: HOME_HONESTY_TIP.title,
    text: HOME_HONESTY_TIP.text
  })

  pool.push({
    title: 'Crisis support',
    text: VA_MENTAL_HEALTH_CRISIS_TIP
  })

  if (!pool.length) {
    return null
  }

  return pool[Math.floor(Math.random() * pool.length)]!
}
