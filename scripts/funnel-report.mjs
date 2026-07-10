#!/usr/bin/env node
/**
 * First-log funnel: signup → conditions → first entry → repeat logging.
 *
 *   node scripts/funnel-report.mjs
 *
 * Writes JSON + CSV to exports/ (gitignored). Requires service role key in .env.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const exportsDir = path.join(rootDir, 'exports')

async function loadDotEnv() {
  try {
    const raw = await readFile(path.join(rootDir, '.env'), 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq <= 0) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (process.env[key] == null) process.env[key] = value
    }
  } catch {
    // .env optional if vars already set
  }
}

function csvEscape(value) {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function pct(part, total) {
  if (!total) return '0%'
  return `${Math.round((part / total) * 100)}%`
}

function daysSince(iso) {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)))
}

function classifyFunnel(user) {
  const entries = user.entry_count
  const hasConditions = user.tracked_condition_count > 0
  const onboardingDone = Boolean(user.conditions_onboarding_completed)

  if (entries >= 10) {
    return 'power_logger'
  }

  if (entries >= 3) {
    return 'repeat_logger'
  }

  if (entries >= 1) {
    return 'first_log'
  }

  if (hasConditions || onboardingDone) {
    return 'picked_conditions_no_log'
  }

  return 'signed_up_no_conditions'
}

const STAGE_LABELS = {
  signed_up_no_conditions: 'Signed up — no conditions picked',
  picked_conditions_no_log: 'Picked conditions — never logged',
  first_log: 'Logged 1–2 entries',
  repeat_logger: 'Logged 3–9 entries',
  power_logger: 'Logged 10+ entries'
}

async function listAllAuthUsers(adminClient) {
  const users = []
  let page = 1

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error

    users.push(...(data.users || []))

    if ((data.users || []).length < 200) {
      break
    }

    page += 1
  }

  return users
}

async function main() {
  await loadDotEnv()

  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.NUXT_SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const tracker = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'tracker' }
  })

  const [authUsers, profilesResult, entriesResult] = await Promise.all([
    listAllAuthUsers(admin),
    tracker.from('user_profiles').select(
      'user_id, full_name, display_name, tracked_condition_keys, conditions_onboarding_completed, logging_cadence, log_reminders_enabled, created_at'
    ),
    tracker.from('symptom_entries').select('user_id')
  ])

  if (profilesResult.error) throw profilesResult.error
  if (entriesResult.error) throw entriesResult.error

  const profilesByUserId = new Map((profilesResult.data || []).map((row) => [row.user_id, row]))
  const entryCounts = new Map()

  for (const row of entriesResult.data || []) {
    entryCounts.set(row.user_id, (entryCounts.get(row.user_id) || 0) + 1)
  }

  const users = authUsers.map((authUser) => {
    const profile = profilesByUserId.get(authUser.id) || null
    const trackedKeys = Array.isArray(profile?.tracked_condition_keys)
      ? profile.tracked_condition_keys.filter(Boolean)
      : []
    const entryCount = entryCounts.get(authUser.id) || 0

    const row = {
      user_id: authUser.id,
      email: authUser.email || '',
      profile_name: profile?.full_name || profile?.display_name || authUser.user_metadata?.full_name || '',
      signed_up_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at,
      days_since_signup: daysSince(authUser.created_at),
      days_since_last_sign_in: daysSince(authUser.last_sign_in_at),
      tracked_condition_count: trackedKeys.length,
      tracked_condition_keys: trackedKeys,
      conditions_onboarding_completed: Boolean(profile?.conditions_onboarding_completed),
      logging_cadence: profile?.logging_cadence || null,
      log_reminders_enabled: Boolean(profile?.log_reminders_enabled),
      entry_count: entryCount,
      has_profile: Boolean(profile)
    }

    row.funnel_stage = classifyFunnel(row)
    row.funnel_label = STAGE_LABELS[row.funnel_stage]

    return row
  }).sort((a, b) => String(b.signed_up_at).localeCompare(String(a.signed_up_at)))

  const total = users.length
  const withConditions = users.filter((u) =>
    u.tracked_condition_count > 0 || u.conditions_onboarding_completed
  ).length
  const withFirstLog = users.filter((u) => u.entry_count >= 1).length
  const repeatLoggers = users.filter((u) => u.entry_count >= 3).length
  const stalled = users.filter((u) => u.funnel_stage === 'picked_conditions_no_log')

  const stageCounts = Object.fromEntries(
    Object.keys(STAGE_LABELS).map((stage) => [
      stage,
      users.filter((u) => u.funnel_stage === stage).length
    ])
  )

  const stamp = new Date().toISOString().slice(0, 10)
  await mkdir(exportsDir, { recursive: true })

  const payload = {
    exported_at: new Date().toISOString(),
    project_url: supabaseUrl,
    summary: {
      total_users: total,
      with_conditions: withConditions,
      with_first_log: withFirstLog,
      repeat_loggers: repeatLoggers,
      stalled_after_conditions: stalled.length,
      conversion: {
        signup_to_conditions: pct(withConditions, total),
        conditions_to_first_log: pct(withFirstLog, withConditions),
        first_log_to_repeat: pct(repeatLoggers, withFirstLog)
      },
      stage_counts: stageCounts
    },
    stalled_users: stalled,
    users
  }

  const jsonPath = path.join(exportsDir, `funnel-report-${stamp}.json`)
  const csvPath = path.join(exportsDir, `funnel-report-${stamp}.csv`)

  const csvHeader = [
    'email',
    'profile_name',
    'funnel_stage',
    'funnel_label',
    'entry_count',
    'tracked_condition_count',
    'conditions_onboarding_completed',
    'logging_cadence',
    'log_reminders_enabled',
    'signed_up_at',
    'last_sign_in_at',
    'days_since_signup',
    'days_since_last_sign_in',
    'user_id'
  ]

  const csvRows = users.map((user) => csvHeader.map((key) => csvEscape(user[key])).join(','))
  await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  await writeFile(csvPath, `${csvHeader.join(',')}\n${csvRows.join('\n')}\n`, 'utf8')

  console.log('\n=== Symptom Tracker — First-log funnel ===\n')
  console.log(`Total users:              ${total}`)
  console.log(`Picked conditions:        ${withConditions} (${pct(withConditions, total)} of signups)`)
  console.log(`Logged at least once:     ${withFirstLog} (${pct(withFirstLog, total)} of signups)`)
  console.log(`Logged 3+ times:          ${repeatLoggers} (${pct(repeatLoggers, total)} of signups)`)
  console.log('')
  console.log('Conversion steps:')
  console.log(`  Signup → conditions:    ${pct(withConditions, total)}`)
  console.log(`  Conditions → first log: ${pct(withFirstLog, withConditions)}`)
  console.log(`  First log → 3+ logs:    ${pct(repeatLoggers, withFirstLog)}`)
  console.log('')
  console.log('By stage:')
  for (const [stage, label] of Object.entries(STAGE_LABELS)) {
    console.log(`  ${label.padEnd(36)} ${stageCounts[stage]}`)
  }

  if (stalled.length) {
    console.log('\n--- Stalled: picked conditions, never logged ---')
    for (const user of stalled.slice(0, 15)) {
      const name = user.profile_name ? ` (${user.profile_name})` : ''
      console.log(
        `  ${user.email}${name} — ${user.tracked_condition_count} condition(s), signed up ${user.days_since_signup}d ago, last in ${user.days_since_last_sign_in ?? '?'}d ago`
      )
    }
    if (stalled.length > 15) {
      console.log(`  … and ${stalled.length - 15} more in CSV`)
    }
  }

  console.log('\nFiles written:')
  console.log(`  ${jsonPath}`)
  console.log(`  ${csvPath}\n`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
