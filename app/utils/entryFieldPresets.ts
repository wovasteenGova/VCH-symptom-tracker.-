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

export function getEntryFieldPresets(fieldLabel: string): EntryFieldPreset[] {
  switch (fieldLabel) {
    case 'Duration':
    case 'Episode duration':
      return durationPresets
    case 'Had to stop activity?':
      return stopActivityPresets
    case 'Kept you from sleeping?':
      return sleepLimitPresets
    case 'Episode type':
      return episodeTypePresets
    default:
      return []
  }
}
