export type EntryFieldDef = {
  label: string
  type: string
  placeholder: string
  stepRole?: 'duration' | 'followUp'
  helper?: string
}

type ConditionEpisodeConfig = {
  duration: Omit<EntryFieldDef, 'stepRole'>
  followUp?: Omit<EntryFieldDef, 'stepRole'>
}

export const defaultEntryFields: EntryFieldDef[] = [
  {
    label: 'Date and time',
    type: 'datetime',
    placeholder: ''
  },
  {
    label: 'How bad was it?',
    type: 'slider',
    placeholder: ''
  },
  {
    label: 'What happened?',
    type: 'textarea',
    placeholder: 'Short note about the symptom, episode, or flare-up.'
  },
  {
    label: 'Daily impact',
    type: 'textarea',
    placeholder: 'Missed work, family activity, sleep, errands, walking, lifting, or other limits.'
  }
]

const durationField: EntryFieldDef = {
  label: 'Duration',
  type: 'text',
  placeholder: 'Example: 30 minutes, 4 hours, all day'
}

const episodeDurationField: EntryFieldDef = {
  label: 'Episode duration',
  type: 'text',
  placeholder: 'Example: 20 minutes, 2 hours, most of the day'
}

const stopActivityField: EntryFieldDef = {
  label: 'Had to stop activity?',
  type: 'text',
  placeholder: 'Lie down, leave work, cancel plans, or avoid movement?'
}

const sleepLimitField: EntryFieldDef = {
  label: 'Kept you from sleeping?',
  type: 'text',
  placeholder: 'Hard to fall asleep, stay asleep, or get useful rest?'
}

const episodeTypeField: EntryFieldDef = {
  label: 'Episode type',
  type: 'text',
  placeholder: 'Panic, nightmare, flashback, suicidal thoughts, isolation...'
}

const conditionEpisodeConfig: Record<string, ConditionEpisodeConfig> = {
  'Migraine / Headache': {
    duration: durationField
  },
  'PTSD / Mental Health': {
    duration: episodeDurationField,
    followUp: episodeTypeField
  },
  'Back or Joint Pain': {
    duration: durationField,
    followUp: stopActivityField
  },
  'Nerve / Radiculopathy': {
    duration: durationField,
    followUp: stopActivityField
  },
  'IBS / Bowel Symptoms': {
    duration: durationField,
    followUp: stopActivityField
  },
  'Sleep Issues': {
    duration: durationField,
    followUp: sleepLimitField
  },
  Respiratory: {
    duration: durationField,
    followUp: stopActivityField
  },
  'Skin Conditions': {
    duration: durationField
  },
  'Chronic Pain / Fatigue': {
    duration: durationField,
    followUp: stopActivityField
  }
}

function buildEntryFields(conditionTitle: string, extraFields: EntryFieldDef[] = []) {
  const fields: EntryFieldDef[] = [
    defaultEntryFields[0]!,
    defaultEntryFields[1]!
  ]

  const episodeConfig = conditionEpisodeConfig[conditionTitle]
  if (episodeConfig) {
    fields.push({ ...episodeConfig.duration, stepRole: 'duration' })
    if (episodeConfig.followUp) {
      fields.push({ ...episodeConfig.followUp, stepRole: 'followUp' })
    }
  }

  fields.push(
    defaultEntryFields[2]!,
    defaultEntryFields[3]!,
    ...extraFields
  )

  return fields
}

export function isEpisodeDurationField(field: { stepRole?: string }) {
  return field.stepRole === 'duration'
}

export function isEpisodeFollowUpField(field: { stepRole?: string }) {
  return field.stepRole === 'followUp'
}

/** VA-informed extra prompts grouped by condition template */
export const entryFieldsByCondition: Record<string, EntryFieldDef[]> = {
  'PTSD / Mental Health': buildEntryFields('PTSD / Mental Health', [
    {
      label: 'Symptoms noticed',
      type: 'text',
      placeholder: 'Nightmares, flashbacks, hypervigilance, avoidance, panic, irritability, suicidal thoughts...',
      helper: 'Tracks common mental health symptoms raters review over time.'
    },
    {
      label: 'Safety note',
      type: 'textarea',
      placeholder: 'Optional: anything important to remember or discuss with your care team.'
    }
  ]),
  'Back or Joint Pain': buildEntryFields('Back or Joint Pain', [
    {
      label: 'Joint symptoms',
      type: 'text',
      placeholder: 'Stiffness, swelling, limited motion, instability, radiating pain...'
    },
    {
      label: 'Movement limit',
      type: 'text',
      placeholder: 'Sitting, standing, walking, lifting, bending...'
    },
    {
      label: 'Flare-up trigger',
      type: 'text',
      placeholder: 'Driving, stairs, lifting groceries, weather, unknown...'
    }
  ]),
  'Nerve / Radiculopathy': buildEntryFields('Nerve / Radiculopathy', [
    {
      label: 'Side affected',
      type: 'text',
      placeholder: 'Left, right, both, arm, leg, foot...'
    },
    {
      label: 'Nerve symptoms',
      type: 'textarea',
      placeholder: 'Numbness, tingling, burning, weakness, falls, radiating pain.'
    }
  ]),
  'Migraine / Headache': buildEntryFields('Migraine / Headache', [
    {
      label: 'Headache symptoms',
      type: 'text',
      placeholder: 'Prostrating attack, aura, light sensitivity, nausea, vertigo...'
    },
    {
      label: 'Had to stop and rest?',
      type: 'text',
      placeholder: 'Lie down, dark room, miss work, cancel plans...'
    }
  ]),
  'IBS / Bowel Symptoms': buildEntryFields('IBS / Bowel Symptoms', [
    {
      label: 'Digestive symptoms',
      type: 'text',
      placeholder: 'Abdominal pain, urgency, diarrhea, constipation, reflux, nausea, vomiting...',
      helper: 'Use this one digestive template for bowel and stomach symptoms.'
    },
    {
      label: 'Medication or food trigger',
      type: 'text',
      placeholder: 'Meal trigger, dairy, spicy food, antacid/PPI, bathroom urgency, or unknown.'
    },
    {
      label: 'Night symptoms',
      type: 'text',
      placeholder: 'Woke up with stomach pain, reflux after lying down, bathroom trips, or no night issues.'
    }
  ]),
  'Sleep Issues': buildEntryFields('Sleep Issues', [
    {
      label: 'Hours slept',
      type: 'number',
      placeholder: 'Example: 4'
    },
    {
      label: 'Sleep interruption',
      type: 'textarea',
      placeholder: 'Nightmares, wake-ups, pain, reflux, panic, breathing issues, fatigue.'
    },
    {
      label: 'Daytime effect',
      type: 'text',
      placeholder: 'Fatigue, naps, trouble focusing, CPAP use, missed activity...'
    }
  ]),
  Respiratory: buildEntryFields('Respiratory', [
    {
      label: 'Breathing symptoms',
      type: 'text',
      placeholder: 'Shortness of breath, wheezing, chest tightness, cough, congestion...'
    },
    {
      label: 'Rescue treatment used',
      type: 'text',
      placeholder: 'Rescue inhaler, nebulizer, CPAP/BiPAP, steroids, or none.'
    },
    {
      label: 'Trigger or limit',
      type: 'text',
      placeholder: 'Exercise, weather, smoke, sleep, stairs, work, or unknown.'
    }
  ]),
  'Skin Conditions': buildEntryFields('Skin Conditions', [
    {
      label: 'Skin symptoms',
      type: 'text',
      placeholder: 'Itching, burning, flare-up, open sores, sleep loss from itching...'
    },
    {
      label: 'Areas affected',
      type: 'text',
      placeholder: 'Hands, arms, legs, scalp, face, widespread...'
    },
    {
      label: 'Treatment used',
      type: 'text',
      placeholder: 'Topical cream, steroids, antihistamine, bath/soak, or none.'
    }
  ]),
  'Chronic Pain / Fatigue': buildEntryFields('Chronic Pain / Fatigue', [
    {
      label: 'Pain and fatigue symptoms',
      type: 'text',
      placeholder: 'Widespread pain, fatigue, brain fog, tender areas, post-exertion crash...'
    },
    {
      label: 'Useful function today',
      type: 'text',
      placeholder: 'Hours you could work, cook, drive, socialize, or care for yourself.'
    },
    {
      label: 'What made it worse',
      type: 'text',
      placeholder: 'Poor sleep, stress, weather, overdoing it, standing, unknown...'
    }
  ])
}

export function getEntryFieldsForSearchCondition(condition: { title: string, category: string }) {
  const title = condition.title.toLowerCase()
  const category = condition.category.toLowerCase()

  if (category.includes('mental')) {
    return entryFieldsByCondition['PTSD / Mental Health']!
  }

  if (category.includes('back') || category.includes('neck') || category.includes('joint')
    || title.includes('arthritis') || title.includes('knee') || title.includes('shoulder')) {
    return entryFieldsByCondition['Back or Joint Pain']!
  }

  if (category.includes('nerve') || title.includes('sciatica') || title.includes('neuropathy') || title.includes('radiculopathy')) {
    return entryFieldsByCondition['Nerve / Radiculopathy']!
  }

  if (category.includes('neurological') || title.includes('migraine') || title.includes('headache') || title.includes('vertigo') || title.includes('seizure')) {
    return entryFieldsByCondition['Migraine / Headache']!
  }

  if (category.includes('digestive') || title.includes('gerd') || title.includes('ibs')
    || title.includes('bowel') || title.includes('diarrhea') || title.includes('constipation')) {
    return entryFieldsByCondition['IBS / Bowel Symptoms']!
  }

  if (category.includes('respiratory') || title.includes('asthma') || title.includes('apnea')
    || title.includes('sinus') || title.includes('rhinitis')) {
    return entryFieldsByCondition.Respiratory!
  }

  if (category.includes('skin') || title.includes('eczema') || title.includes('psoriasis') || title.includes('dermatitis')) {
    return entryFieldsByCondition['Skin Conditions']!
  }

  if (category.includes('chronic pain') || category.includes('fatigue')
    || title.includes('fibromyalgia') || title.includes('fatigue')) {
    return entryFieldsByCondition['Chronic Pain / Fatigue']!
  }

  if (category.includes('sleep') || title.includes('insomnia')) {
    return entryFieldsByCondition['Sleep Issues']!
  }

  return defaultEntryFields
}

export function resolveEntryTemplateKey(label: string) {
  if (label in entryFieldsByCondition) {
    return label
  }

  return null
}
