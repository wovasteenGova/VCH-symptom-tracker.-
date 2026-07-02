export type EntryFieldPreset = {
  label: string
  value: string
}

export const durationPresets: EntryFieldPreset[] = [
  { label: '15 min', value: '15 minutes' },
  { label: '30 min', value: '30 minutes' },
  { label: '1 hour', value: '1 hour' },
  { label: '2 hours', value: '2 hours' },
  { label: '4 hours', value: '4 hours' },
  { label: 'All day', value: 'All day' }
]

export const stopActivityPresets: EntryFieldPreset[] = [
  { label: 'No', value: 'No - kept going' },
  { label: 'Slowed down', value: 'Slowed down but continued' },
  { label: 'Had to rest', value: 'Yes - had to rest or lie down' },
  { label: 'Stopped work', value: 'Yes - left work or stopped activity' },
  { label: 'Cancelled plans', value: 'Yes - cancelled plans or errands' }
]

export const sleepLimitPresets: EntryFieldPreset[] = [
  { label: 'Slept OK', value: 'Sleep was mostly OK' },
  { label: 'Wake-ups', value: 'Woke up several times' },
  { label: 'Hard to fall asleep', value: 'Hard to fall asleep' },
  { label: 'Barely slept', value: 'Barely slept' },
  { label: 'No useful rest', value: 'No useful rest' }
]

export const episodeTypePresets: EntryFieldPreset[] = [
  { label: 'Panic', value: 'Panic' },
  { label: 'Nightmare', value: 'Nightmare' },
  { label: 'Flashback', value: 'Flashback' },
  { label: 'Isolation', value: 'Isolation' },
  { label: 'Irritability', value: 'Irritability' }
]

export const mentalHealthSymptomPresets: EntryFieldPreset[] = [
  { label: 'Nightmares', value: 'Nightmares' },
  { label: 'Flashbacks', value: 'Flashbacks' },
  { label: 'Hypervigilance', value: 'Hypervigilance' },
  { label: 'Avoidance', value: 'Avoidance' },
  { label: 'Panic', value: 'Panic' },
  { label: 'Irritability', value: 'Irritability' },
  { label: 'Isolation', value: 'Isolation' }
]

export const backJointSymptomPresets: EntryFieldPreset[] = [
  { label: 'Stiffness', value: 'Stiffness' },
  { label: 'Swelling', value: 'Swelling' },
  { label: 'Limited motion', value: 'Limited range of motion' },
  { label: 'Instability', value: 'Joint instability' },
  { label: 'Radiating pain', value: 'Radiating pain' }
]

export const nerveSymptomPresets: EntryFieldPreset[] = [
  { label: 'Numbness', value: 'Numbness' },
  { label: 'Tingling', value: 'Tingling' },
  { label: 'Burning', value: 'Burning pain' },
  { label: 'Weakness', value: 'Weakness' },
  { label: 'Falls', value: 'Near fall or fall' }
]

export const migraineSymptomPresets: EntryFieldPreset[] = [
  { label: 'Prostrating', value: 'Prostrating attack' },
  { label: 'Light sensitivity', value: 'Light sensitivity' },
  { label: 'Sound sensitivity', value: 'Sound sensitivity' },
  { label: 'Nausea', value: 'Nausea or vomiting' },
  { label: 'Aura', value: 'Aura' },
  { label: 'Vertigo', value: 'Vertigo or dizziness' }
]

export const digestiveSymptomPresets: EntryFieldPreset[] = [
  { label: 'Heartburn', value: 'Heartburn' },
  { label: 'Regurgitation', value: 'Regurgitation' },
  { label: 'Trouble swallowing', value: 'Trouble swallowing' },
  { label: 'Pain swallowing', value: 'Pain when swallowing' },
  { label: 'Vomiting', value: 'Vomiting' },
  { label: 'Nausea', value: 'Nausea' },
  { label: 'Diarrhea', value: 'Diarrhea' },
  { label: 'Constipation', value: 'Constipation' }
]

export const digestiveNightSymptomPresets: EntryFieldPreset[] = [
  { label: 'Slept propped up', value: 'Slept propped up' },
  { label: 'Woke up choking', value: 'Woke up choking or aspirating' },
  { label: 'Reflux lying down', value: 'Reflux after lying down' },
  { label: 'No night issues', value: 'No major night symptoms' }
]

export const digestiveTriggerPresets: EntryFieldPreset[] = [
  { label: 'Late meal', value: 'Late meal or snacking' },
  { label: 'Spicy/acidic food', value: 'Spicy or acidic food' },
  { label: 'Alcohol', value: 'Alcohol' },
  { label: 'Took antacid/PPI', value: 'Used antacid or PPI' },
  { label: 'Unknown', value: 'Unknown trigger' }
]

export const sleepDayEffectPresets: EntryFieldPreset[] = [
  { label: 'Heavy fatigue', value: 'Heavy daytime fatigue' },
  { label: 'Needed naps', value: 'Needed naps' },
  { label: 'Trouble focusing', value: 'Trouble focusing' },
  { label: 'Used CPAP', value: 'Used CPAP/BiPAP' },
  { label: 'Missed activity', value: 'Missed work or activity' }
]

export const respiratorySymptomPresets: EntryFieldPreset[] = [
  { label: 'Short of breath', value: 'Shortness of breath' },
  { label: 'Wheezing', value: 'Wheezing' },
  { label: 'Chest tightness', value: 'Chest tightness' },
  { label: 'Cough', value: 'Cough' },
  { label: 'Congestion', value: 'Congestion' }
]

export const respiratoryTreatmentPresets: EntryFieldPreset[] = [
  { label: 'Rescue inhaler', value: 'Rescue inhaler' },
  { label: 'Nebulizer', value: 'Nebulizer' },
  { label: 'CPAP/BiPAP', value: 'CPAP/BiPAP' },
  { label: 'Steroids', value: 'Steroids' },
  { label: 'None', value: 'No rescue treatment' }
]

export const skinSymptomPresets: EntryFieldPreset[] = [
  { label: 'Itching', value: 'Itching' },
  { label: 'Burning', value: 'Burning' },
  { label: 'Flare-up', value: 'Flare-up' },
  { label: 'Open sores', value: 'Open sores or cracking' },
  { label: 'Sleep loss', value: 'Sleep loss from itching' }
]

export const chronicPainSymptomPresets: EntryFieldPreset[] = [
  { label: 'Widespread pain', value: 'Widespread pain' },
  { label: 'Fatigue', value: 'Fatigue' },
  { label: 'Brain fog', value: 'Brain fog' },
  { label: 'Tender areas', value: 'Tender areas' },
  { label: 'Post-exertion crash', value: 'Post-exertion crash' }
]

const multiSelectPresetFields = new Set([
  'Symptoms noticed',
  'Joint symptoms',
  'Pain and fatigue symptoms',
  'Headache symptoms',
  'Digestive symptoms',
  'Night symptoms',
  'Medication or food trigger',
  'Nerve symptoms',
  'Daytime effect',
  'Breathing symptoms',
  'Rescue treatment used',
  'Skin symptoms'
])

function splitPresetValues(value: string) {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function isMultiSelectPresetField(fieldLabel: string) {
  return multiSelectPresetFields.has(fieldLabel)
}

export function entryPresetIsSelected(currentValue: string | undefined, presetValue: string) {
  if (!currentValue?.trim()) {
    return false
  }

  const normalizedPreset = presetValue.trim().toLowerCase()
  return splitPresetValues(currentValue).some((part) => part.toLowerCase() === normalizedPreset)
}

export function toggleEntryFieldPresetValue(currentValue: string | undefined, presetValue: string) {
  const parts = splitPresetValues(currentValue || '')
  const normalizedPreset = presetValue.trim().toLowerCase()
  const existingIndex = parts.findIndex((part) => part.toLowerCase() === normalizedPreset)

  if (existingIndex >= 0) {
    parts.splice(existingIndex, 1)
  } else {
    parts.push(presetValue.trim())
  }

  return parts.join(', ')
}

export function getEntryFieldPresets(fieldLabel: string): EntryFieldPreset[] {
  switch (fieldLabel) {
    case 'Duration':
    case 'Episode duration':
      return durationPresets
    case 'Had to stop activity?':
    case 'Had to stop and rest?':
      return stopActivityPresets
    case 'Kept you from sleeping?':
      return sleepLimitPresets
    case 'Episode type':
      return episodeTypePresets
    case 'Symptoms noticed':
      return mentalHealthSymptomPresets
    case 'Joint symptoms':
      return backJointSymptomPresets
    case 'Pain and fatigue symptoms':
      return chronicPainSymptomPresets
    case 'Headache symptoms':
      return migraineSymptomPresets
    case 'Digestive symptoms':
      return digestiveSymptomPresets
    case 'Night symptoms':
      return digestiveNightSymptomPresets
    case 'Medication or food trigger':
      return digestiveTriggerPresets
    case 'Nerve symptoms':
      return nerveSymptomPresets
    case 'Daytime effect':
      return sleepDayEffectPresets
    case 'Breathing symptoms':
      return respiratorySymptomPresets
    case 'Rescue treatment used':
      return respiratoryTreatmentPresets
    case 'Skin symptoms':
      return skinSymptomPresets
    default:
      return []
  }
}
