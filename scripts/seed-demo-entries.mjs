/**
 * One-off demo seed for Philippe's test accounts on VCH tracker.
 * Usage:
 *   node scripts/seed-demo-entries.mjs            # full seed (random counts per account)
 *   node scripts/seed-demo-entries.mjs --top-up   # add uneven extras (legacy)
 *   node scripts/seed-demo-entries.mjs --fix-dates # rebalance dates (~2 logs/week, varied spans)
 * Requires SUPABASE_URL + SUPABASE_SERVICE_KEY in .env
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv() {
  const env = {}
  for (const line of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
  }
  return env
}

function conditionKey(label) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickN(arr, n) {
  const copy = [...arr]
  const out = []
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0])
  }
  return out
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function toLocalDateTimeInput(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function hashString(input) {
  let hash = 2166136261

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

function createRng(seed) {
  let state = seed >>> 0

  return () => {
    state += 0x6d2b79f5
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function randIntRng(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1))
}

function randomTimeOnDay(dayDate, rng) {
  const occurredAt = new Date(dayDate)
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
  const minutes = [0, 5, 10, 15, 20, 30, 45]
  occurredAt.setHours(
    hours[randIntRng(rng, 0, hours.length - 1)],
    minutes[randIntRng(rng, 0, minutes.length - 1)],
    0,
    0
  )
  return occurredAt
}

function buildScheduledDates({
  veteranCount,
  familyCount,
  historyWeeks,
  rng,
  now = new Date()
}) {
  const notAfter = new Date(now)
  notAfter.setHours(23, 59, 59, 999)

  const veteranDates = []
  let monthCursor = new Date(notAfter.getFullYear(), notAfter.getMonth(), 1)
  const earliestMs = notAfter.getTime() - historyWeeks * 7 * 86400000

  while (veteranDates.length < veteranCount && monthCursor.getTime() >= earliestMs) {
    const year = monthCursor.getFullYear()
    const month = monthCursor.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weekCount = Math.ceil(daysInMonth / 7)

    for (let weekIndex = 0; weekIndex < weekCount && veteranDates.length < veteranCount; weekIndex += 1) {
      const startDay = weekIndex * 7 + 1
      const endDay = Math.min(startDay + 6, daysInMonth)
      const roll = rng()
      const logsThisWeek = roll < 0.1 ? 1 : roll < 0.85 ? 2 : 3

      for (let logIndex = 0; logIndex < logsThisWeek && veteranDates.length < veteranCount; logIndex += 1) {
        const day = randIntRng(rng, startDay, endDay)
        const occurredAt = randomTimeOnDay(new Date(year, month, day), rng)

        if (occurredAt <= notAfter) {
          veteranDates.push(occurredAt)
        }
      }
    }

    monthCursor = new Date(year, month - 1, 1)
  }

  veteranDates.sort((left, right) => left.getTime() - right.getTime())
  veteranDates.splice(veteranCount)

  const familyDates = []
  let familyMonthCursor = new Date(notAfter.getFullYear(), notAfter.getMonth(), 1)
  let weeksUntilFamily = randIntRng(rng, 2, 4)

  while (familyDates.length < familyCount && familyMonthCursor.getTime() >= earliestMs) {
    const year = familyMonthCursor.getFullYear()
    const month = familyMonthCursor.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const weekCount = Math.ceil(daysInMonth / 7)

    for (let weekIndex = 0; weekIndex < weekCount && familyDates.length < familyCount; weekIndex += 1) {
      weeksUntilFamily -= 1

      if (weeksUntilFamily > 0) {
        continue
      }

      const startDay = weekIndex * 7 + 1
      const endDay = Math.min(startDay + 6, daysInMonth)
      const day = randIntRng(rng, startDay, endDay)
      const occurredAt = randomTimeOnDay(new Date(year, month, day), rng)

      if (occurredAt <= notAfter) {
        familyDates.push(occurredAt)
      }

      weeksUntilFamily = randIntRng(rng, 3, 6)
    }

    familyMonthCursor = new Date(year, month - 1, 1)
  }

  while (familyDates.length < familyCount) {
    const year = notAfter.getFullYear()
    const month = notAfter.getMonth()
    const day = randIntRng(rng, 1, notAfter.getDate())
    familyDates.push(randomTimeOnDay(new Date(year, month, day), rng))
  }

  familyDates.sort((left, right) => left.getTime() - right.getTime())
  familyDates.splice(familyCount)

  return { veteranDates, familyDates }
}

const DECLARATION =
  'By submitting this observation, I confirm that the information reflects what I personally observed and is submitted in good faith. My name, email, phone number, and relationship will be stored on this report for the veteran\'s review.'

const ACCOUNT_DEFINITIONS = [
  {
    email: 'philippeashelton@gmail.com',
    fullName: 'Philippe Shelton',
    veteranRange: [41, 52],
    familyRange: [7, 11],
    historyWeeks: [52, 68],
    conditions: [
      { label: 'Lower back pain', key: 'lower_back_pain' },
      { label: 'GERD / Acid Reflux', key: 'gerd_acid_reflux' },
      { label: 'Insomnia / Sleep disturbance', key: 'insomnia_sleep_disturbances' },
      { label: 'PTSD', key: 'ptsd' }
    ],
    familyReporters: [
      { first: 'Maria', last: 'Shelton', relationship: 'Spouse', email: 'maria.shelton.demo@example.com', phone: '6125550142' },
      { first: 'Linda', last: 'Shelton', relationship: 'Mother', email: 'linda.shelton.demo@example.com', phone: '6125550198' }
    ]
  },
  {
    email: 'noway5287@gmail.com',
    fullName: 'Philippe Shelton',
    veteranRange: [19, 31],
    familyRange: [3, 7],
    historyWeeks: [18, 26],
    conditions: [
      { label: 'Sleep apnea', key: 'sleep_apnea' },
      { label: 'Tinnitus', key: 'tinnitus' },
      { label: 'Migraine', key: 'migraine' }
    ],
    familyReporters: [
      { first: 'Jamie', last: 'Ross', relationship: 'Partner', email: 'jamie.ross.demo@example.com', phone: '6515550133' }
    ]
  },
  {
    email: '3dhomeprinter4@gmail.com',
    fullName: 'Philippe Shelton',
    veteranRange: [24, 36],
    familyRange: [2, 6],
    historyWeeks: [22, 30],
    conditions: [
      { label: 'Knee conditions', key: 'knee_conditions' },
      { label: 'Radiculopathy', key: 'radiculopathy' },
      { label: 'IBS / Bowel Symptoms', key: 'ibs_bowel_symptoms' }
    ],
    familyReporters: [
      { first: 'Mike', last: 'Shelton', relationship: 'Brother', email: 'mike.shelton.demo@example.com', phone: '7635550177' }
    ]
  },
  {
    email: 'wobasta@gmail.com',
    fullName: 'Wovasteen Gova',
    veteranRange: [16, 28],
    familyRange: [4, 9],
    historyWeeks: [14, 22],
    conditions: [
      { label: 'Depression', key: 'depression' },
      { label: 'Chronic fatigue', key: 'chronic_fatigue' },
      { label: 'Neck pain', key: 'neck_pain' }
    ],
    familyReporters: [
      { first: 'Alex', last: 'Gova', relationship: 'Partner', email: 'alex.gova.demo@example.com', phone: '9525550161' }
    ]
  }
]

/** Preserve realistic totals if a partial run cleared entries. */
const FIX_DATE_FALLBACK = {
  'philippeashelton@gmail.com': { veteran: 54, family: 10 }
}

/** Uneven top-ups for accounts that already got identical first-pass counts. */
const TOP_UP_BY_EMAIL = {
  'noway5287@gmail.com': { veteran: 9, family: 2 },
  '3dhomeprinter4@gmail.com': { veteran: 12, family: 1 },
  'wobasta@gmail.com': { veteran: 3, family: 4 }
}

function resolveAccountCounts(definition, mode) {
  if (mode === 'top-up') {
    return TOP_UP_BY_EMAIL[definition.email] || null
  }

  return {
    veteran: randInt(definition.veteranRange[0], definition.veteranRange[1]),
    family: randInt(definition.familyRange[0], definition.familyRange[1])
  }
}

const VETERAN_TEMPLATES = {
  lower_back_pain: {
    summaries: [
      'Back locked up after yard work.',
      'Pain down left leg again.',
      'Could barely get out of bed.',
      'Stiff all morning after sleeping wrong.',
      'Flare after driving 2 hours.'
    ],
    impacts: [
      'Left work early',
      'Skipped chores or self-care',
      'Hard to focus or finish tasks',
      'Slowed down but continued',
      'Could not drive'
    ],
    extras: {
      joint_symptoms: ['Stiffness', 'Radiating pain', 'Limited range of motion'],
      movement_limit: ['Limited bending', 'Limited sitting', 'Limited lifting'],
      flare_up_trigger: ['Lifting groceries or objects', 'Driving', 'Prolonged sitting'],
      medications_for_this_entry: ['Ibuprofen 800mg', 'Cyclobenzaprine 10mg', 'Diclofenac gel']
    }
  },
  gerd_acid_reflux: {
    summaries: [
      'Heartburn after dinner, bad lying down.',
      'Woke up choking on reflux.',
      'Burning in chest after coffee.',
      'Skipped lunch, felt nauseous all afternoon.',
      'Acid taste in throat most of the night.'
    ],
    impacts: ['Poor sleep', 'Missed work', 'Cancelled plans', 'Hard to focus or finish tasks'],
    extras: {
      digestive_symptoms: ['Heartburn', 'Regurgitation', 'Nausea'],
      medication_or_food_trigger: ['Late meal or snacking', 'Spicy or acidic food', 'Lying down after eating'],
      medications_for_this_entry: ['Omeprazole 40mg', 'Famotidine 20mg BID', 'Calcium carbonate antacid PRN']
    }
  },
  insomnia_sleep_disturbances: {
    summaries: [
      'Maybe 3 hours total sleep.',
      'Up every hour, mind racing.',
      'Nightmares again.',
      'Fell asleep at desk in afternoon.',
      'Alarm went off feeling like I never slept.'
    ],
    impacts: ['Poor sleep', 'Left work early', 'Hard to focus or finish tasks', 'Cancelled plans'],
    extras: {
      sleep_interruption: ['Multiple wake-ups', 'Nightmares', 'Pain interrupted sleep'],
      hours_slept: ['3', '4', '5'],
      medications_for_this_entry: ['Trazodone 50mg at bedtime', 'Melatonin 3mg at bedtime']
    }
  },
  ptsd: {
    summaries: [
      'Crowded store set me off.',
      'Flashback on the drive home.',
      'Irritable all day, snapped at kids.',
      'Avoided the reunion invite.',
      'Hypervigilant at work, exhausted by noon.'
    ],
    impacts: ['Avoided people or social plans', 'Hard to focus or finish tasks', 'Poor sleep', 'Stayed home'],
    extras: {
      episode_type: ['Flashback', 'Hypervigilance', 'Irritability', 'Avoidance'],
      symptoms_noticed: ['Hypervigilance', 'Irritability', 'Poor sleep', 'Anxiety'],
      medications_for_this_entry: ['Sertraline 100mg daily', 'Prazosin 1mg at bedtime']
    }
  },
  sleep_apnea: {
    summaries: [
      'Skipped CPAP, felt wrecked.',
      'Woke with headache.',
      'Partner said I stopped breathing.',
      'Used CPAP but still tired.',
      'Dozed off in a meeting.'
    ],
    impacts: ['Poor sleep', 'Left work early', 'Hard to focus or finish tasks'],
    extras: {
      sleep_interruption: ['Snoring or stopped breathing', 'Skipped CPAP/BiPAP', 'Multiple wake-ups'],
      daytime_effect: ['Heavy daytime fatigue', 'Morning headache', 'Trouble focusing'],
      medications_for_this_entry: ['CPAP nightly', 'Skipped CPAP/BiPAP']
    }
  },
  tinnitus: {
    summaries: [
      'Ringing worse in quiet room.',
      'Couldnt hear conversation at dinner.',
      'Buzzing kept me up.',
      'Left ear louder today.',
      'TV volume way up again.'
    ],
    impacts: ['Poor sleep', 'Hard to focus or finish tasks', 'Cancelled plans'],
    extras: {
      ear_symptoms: ['Ringing', 'Buzzing', 'One ear'],
      hearing_impact: ['Trouble sleeping', 'Missed conversation', 'Turned TV or radio louder']
    }
  },
  migraine: {
    summaries: [
      'Light sensitivity, had to lie down.',
      'Aura then pounding headache.',
      'Threw up once, stayed in dark room.',
      'Had to leave work early.',
      'Excedrin helped a little.'
    ],
    impacts: ['Left work early', 'Cancelled plans', 'Poor sleep'],
    extras: {
      headache_symptoms: ['Light sensitivity', 'Nausea or vomiting', 'One-sided headache', 'Prostrating attack'],
      medications_for_this_entry: ['Sumatriptan 100mg PRN', 'Ibuprofen 800mg', 'Excedrin Migraine PRN']
    }
  },
  knee_conditions: {
    summaries: [
      'Knee gave out on stairs.',
      'Swollen after walking the dog.',
      'Stairs at work were brutal.',
      'Ice helped but still limping.',
      'Couldnt kneel to play with kids.'
    ],
    impacts: ['Slowed down but continued', 'Skipped chores or self-care', 'Could not drive'],
    extras: {
      joint_symptoms: ['Swelling', 'Limited range of motion', 'Instability'],
      movement_limit: ['Limited stairs', 'Limited walking', 'Limited bending'],
      medications_for_this_entry: ['Ibuprofen 800mg', 'Diclofenac gel']
    }
  },
  radiculopathy: {
    summaries: [
      'Burning down right arm.',
      'Hand went numb while typing.',
      'Dropped a cup, grip weak.',
      'Pain worse when I tilt head.',
      'Leg felt dead weight this morning.'
    ],
    impacts: ['Hard to focus or finish tasks', 'Slowed down but continued', 'Left work early'],
    extras: {
      nerve_symptoms: ['Numbness', 'Tingling', 'Burning pain', 'Weakness'],
      side_affected: ['Right arm', 'Left leg', 'Right side'],
      medications_for_this_entry: ['Gabapentin 300mg TID', 'Ibuprofen 800mg']
    }
  },
  ibs_bowel_symptoms: {
    summaries: [
      'Urgent bathroom run after lunch.',
      'Cramping most of the afternoon.',
      'Had to leave family dinner early.',
      'Constipated then sudden diarrhea.',
      'Bloating, uncomfortable all day.'
    ],
    impacts: ['Cancelled plans', 'Left work early', 'Stayed home'],
    extras: {
      digestive_symptoms: ['Abdominal pain', 'Bowel urgency', 'Diarrhea', 'Constipation'],
      medication_or_food_trigger: ['Dairy', 'Stress', 'Late meal or snacking'],
      medications_for_this_entry: ['Loperamide 2mg PRN', 'Polyethylene glycol daily']
    }
  },
  depression: {
    summaries: [
      'No motivation to get up.',
      'Cried for no reason, stayed in bed.',
      'Skipped therapy appointment guilt.',
      'Felt flat, didnt talk much.',
      'Hard to shower, ate once all day.'
    ],
    impacts: ['Stayed home', 'Skipped chores or self-care', 'Avoided people or social plans'],
    extras: {
      symptoms_noticed: ['Depression', 'Isolation', 'Poor sleep'],
      episode_type: ['Isolation', 'Depression'],
      medications_for_this_entry: ['Sertraline 100mg daily', 'Trazodone 50mg at bedtime']
    }
  },
  chronic_fatigue: {
    summaries: [
      'Post grocery store crash.',
      'Brain fog, forgot appt.',
      'Slept 10 hrs, still tired.',
      'Couldnt finish laundry.',
      'Wiped out after short walk.'
    ],
    impacts: ['Skipped chores or self-care', 'Partial work day only', 'Stayed home'],
    extras: {
      pain_and_fatigue_symptoms: ['Fatigue', 'Brain fog', 'Post-exertion crash'],
      useful_function_today: ['Partial work day only', 'Needed help with self-care'],
      medications_for_this_entry: ['Ibuprofen 800mg']
    }
  },
  neck_pain: {
    summaries: [
      'Neck stiff from computer work.',
      'Headache from base of skull.',
      'Couldnt turn head to check blind spot.',
      'Worse after sleeping on couch.',
      'Tension all day, heat helped some.'
    ],
    impacts: ['Could not drive', 'Slowed down but continued', 'Poor sleep'],
    extras: {
      joint_symptoms: ['Stiffness', 'Radiating pain'],
      movement_limit: ['Limited driving', 'Limited bending'],
      medications_for_this_entry: ['Cyclobenzaprine 10mg', 'Ibuprofen 800mg']
    }
  }
}

const FAMILY_OBSERVATIONS = {
  default: {
    summaries: [
      'He was clearly in pain and moving slow.',
      'Had to sit down during dinner.',
      'I noticed he was irritable and withdrawn.',
      'He cancelled on us last minute again.',
      'Looked exhausted, napped on the couch at 4pm.',
      'He was up and down all night.',
      'He asked me to drive because his back was acting up.',
      'I could hear him coughing/choking in sleep.'
    ],
    impacts: [
      'They cancelled plans',
      'They needed help with daily tasks',
      'They had trouble sleeping',
      'They seemed irritable or withdrawn',
      'They missed work or left early'
    ]
  }
}

function buildVeteranEntry(userId, condition, occurredAt) {
  const tpl = VETERAN_TEMPLATES[condition.key] || VETERAN_TEMPLATES.lower_back_pain
  const summary = pick(tpl.summaries)
  const impact = pickN(tpl.impacts, randInt(1, 2)).join(', ')
  const severity = randInt(3, 8)
  const localDt = toLocalDateTimeInput(occurredAt)
  const details = {
    date_and_time: localDt,
    what_happened: summary,
    daily_impact: impact,
    functional_impact: pick(['Disruptive', 'Slowed down but continued', 'Had to rest', 'Annoying'])
  }

  for (const [key, values] of Object.entries(tpl.extras || {})) {
    if (Math.random() > 0.25) {
      details[key] = pickN(values, randInt(1, Math.min(3, values.length))).join(', ')
    }
  }

  if (Math.random() > 0.4 && details.medications_for_this_entry) {
    details.symptoms_managed_by_medication = pick([
      'Yes - symptoms improved',
      'Partial relief',
      'No relief',
      'Not applicable / no meds taken'
    ])
  }

  if (Math.random() > 0.5) {
    details.duration = pick(['30 minutes', '2 hours', '4 hours', 'All day', 'Most of the day'])
  }

  const createdAt = new Date(occurredAt.getTime() + randInt(5, 180) * 60000)

  return {
    user_id: userId,
    condition_key: condition.key,
    condition_label: condition.label,
    source: 'veteran',
    entry_status: 'complete',
    severity,
    occurred_at: occurredAt.toISOString(),
    summary,
    impact,
    details,
    created_at: createdAt.toISOString(),
    updated_at: createdAt.toISOString()
  }
}

function buildFamilyEntry(userId, condition, occurredAt, reporter) {
  const tpl = FAMILY_OBSERVATIONS.default
  const summary = pick(tpl.summaries)
  const impact = pickN(tpl.impacts, randInt(1, 2)).join(', ')
  const severity = randInt(4, 8)
  const signatureName = `${reporter.first} ${reporter.last}`
  const createdAt = new Date(occurredAt.getTime() + randInt(10, 240) * 60000)

  return {
    user_id: userId,
    condition_key: condition.key,
    condition_label: condition.label,
    source: 'family',
    entry_status: 'complete',
    severity,
    occurred_at: occurredAt.toISOString(),
    summary,
    impact,
    details: {
      submitted_via: 'supporter_link',
      reporter_first_name: reporter.first,
      reporter_last_name: reporter.last,
      reporter_email: reporter.email,
      reporter_phone: reporter.phone,
      reporter_relationship: reporter.relationship,
      signature_name: signatureName,
      declaration_text: DECLARATION,
      related_entry_id: null,
      related_entry_summary: null
    },
    created_at: createdAt.toISOString(),
    updated_at: createdAt.toISOString()
  }
}

function resolveHistoryWeeks(definition, rng) {
  const range = definition.historyWeeks || [20, 28]
  return randIntRng(rng, range[0], range[1])
}

async function countEntriesBySource(tracker, userId) {
  const { count: veteran, error: veteranError } = await tracker
    .from('symptom_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', 'veteran')

  if (veteranError) {
    throw veteranError
  }

  const { count: family, error: familyError } = await tracker
    .from('symptom_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('source', 'family')

  if (familyError) {
    throw familyError
  }

  return {
    veteran: veteran || 0,
    family: family || 0
  }
}

async function seedAccount({ admin, tracker, usersByEmail, definition, counts, updateProfile, mode }) {
  const user = usersByEmail.get(definition.email.toLowerCase())
  if (!user) {
    console.warn(`Skip missing user: ${definition.email}`)
    return 0
  }

  const rng = createRng(hashString(definition.email))

  if (mode === 'fix-dates') {
    const existing = await countEntriesBySource(tracker, user.id)
    counts = existing

    if (counts.veteran + counts.family === 0) {
      counts = FIX_DATE_FALLBACK[definition.email] || {
        veteran: randInt(definition.veteranRange[0], definition.veteranRange[1]),
        family: randInt(definition.familyRange[0], definition.familyRange[1])
      }
    }

    const { error: deleteError } = await tracker
      .from('symptom_entries')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) {
      throw new Error(`${definition.email}: ${deleteError.message}`)
    }
  }

  if (updateProfile) {
    await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, full_name: definition.fullName }
    })

    const conditionKeys = definition.conditions.map((c) => c.key)

    await tracker.from('user_profiles').upsert({
      user_id: user.id,
      full_name: definition.fullName,
      display_name: definition.fullName.split(' ')[0],
      tracked_condition_keys: conditionKeys,
      conditions_onboarding_completed: true,
      app_welcome_completed: true,
      logging_cadence: 'weekly',
      weekly_log_day: 0,
      terms_accepted_at: user.created_at,
      updated_at: new Date().toISOString()
    })
  }

  const historyWeeks = resolveHistoryWeeks(definition, rng)
  const { veteranDates, familyDates } = buildScheduledDates({
    veteranCount: counts.veteran,
    familyCount: counts.family,
    historyWeeks,
    rng
  })

  const rows = []

  for (const occurredAt of veteranDates) {
    const condition = pick(definition.conditions)
    rows.push(buildVeteranEntry(user.id, condition, occurredAt))
  }

  for (const occurredAt of familyDates) {
    const condition = pick(definition.conditions)
    const reporter = pick(definition.familyReporters)
    rows.push(buildFamilyEntry(user.id, condition, occurredAt, reporter))
  }

  rows.sort((a, b) => new Date(a.occurred_at) - new Date(b.occurred_at))

  for (let i = 0; i < rows.length; i += 50) {
    const chunk = rows.slice(i, i + 50)
    const { error } = await tracker.from('symptom_entries').insert(chunk)
    if (error) throw new Error(`${definition.email}: ${error.message}`)
  }

  if (rows.length) {
    const first = rows[0].occurred_at.slice(0, 10)
    const last = rows[rows.length - 1].occurred_at.slice(0, 10)
    console.log(
      `${definition.email}: +${rows.length} (${counts.veteran} veteran, ${counts.family} family) · ${historyWeeks} weeks · ${first} → ${last}`
    )
  } else {
    console.log(`${definition.email}: no entries`)
  }

  return rows.length
}

async function main() {
  const mode = process.argv.includes('--fix-dates')
    ? 'fix-dates'
    : process.argv.includes('--top-up')
      ? 'top-up'
      : 'seed'
  const env = loadEnv()
  const url = env.SUPABASE_URL || env.NUXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_KEY

  if (!url?.includes('bszlmqdqrwqocoxbzpyh')) {
    throw new Error('Refusing to run: SUPABASE_URL is not the VCH project.')
  }
  if (!key) throw new Error('Missing SUPABASE_SERVICE_KEY')

  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const tracker = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, db: { schema: 'tracker' } })

  const { data: listData, error: listError } = await admin.auth.admin.listUsers({ perPage: 200 })
  if (listError) throw listError

  const usersByEmail = new Map(listData.users.map((u) => [u.email?.toLowerCase(), u]))

  let totalInserted = 0

  for (const definition of ACCOUNT_DEFINITIONS) {
    if (mode === 'fix-dates') {
      totalInserted += await seedAccount({
        admin,
        tracker,
        usersByEmail,
        definition,
        counts: { veteran: 0, family: 0 },
        updateProfile: false,
        mode
      })
      continue
    }

    const counts = resolveAccountCounts(definition, mode)
    if (!counts) {
      continue
    }

    totalInserted += await seedAccount({
      admin,
      tracker,
      usersByEmail,
      definition,
      counts,
      updateProfile: mode === 'seed',
      mode
    })
  }

  console.log(`Done (${mode}). Inserted ${totalInserted} demo entries.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
