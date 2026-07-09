#!/usr/bin/env node
/**
 * Full local backup of tracker schema + linked auth users.
 * Writes to exports/tracker-backup-YYYY-MM-DD/ (gitignored).
 *
 *   node scripts/export-tracker-backup.mjs
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const exportsDir = path.join(rootDir, 'exports')

const TRACKER_TABLES = [
  'user_profiles',
  'symptom_entries',
  'symptom_entry_drafts',
  'user_entitlements',
  'supporter_profiles',
  'supporter_link_tokens',
  'push_subscriptions',
  'log_reminder_deliveries'
]

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

async function fetchAllRows(client, table) {
  const pageSize = 1000
  const rows = []
  let from = 0

  while (true) {
    const { data, error } = await client
      .from(table)
      .select('*')
      .range(from, from + pageSize - 1)

    if (error) throw error

    const batch = data || []
    rows.push(...batch)

    if (batch.length < pageSize) break
    from += pageSize
  }

  return rows
}

async function listAllAuthUsers(adminClient) {
  const users = []
  let page = 1

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    users.push(...(data.users || []))
    if ((data.users || []).length < 200) break
    page += 1
  }

  return users
}

function sanitizeAuthUser(user) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    created_at: user.created_at,
    updated_at: user.updated_at,
    last_sign_in_at: user.last_sign_in_at,
    email_confirmed_at: user.email_confirmed_at,
    confirmed_at: user.confirmed_at,
    is_anonymous: user.is_anonymous,
    app_metadata: user.app_metadata || {},
    user_metadata: user.user_metadata || {}
  }
}

async function main() {
  await loadDotEnv()

  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
    || process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.NUXT_SUPABASE_SERVICE_KEY
    || process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL / NUXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const tracker = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'tracker' }
  })

  const stamp = new Date().toISOString().slice(0, 10)
  const outDir = path.join(exportsDir, `tracker-backup-${stamp}`)
  await mkdir(outDir, { recursive: true })

  const tables = {}
  const counts = {}

  for (const table of TRACKER_TABLES) {
    const rows = await fetchAllRows(tracker, table)
    tables[table] = rows
    counts[table] = rows.length
    await writeFile(
      path.join(outDir, `${table}.json`),
      `${JSON.stringify(rows, null, 2)}\n`,
      'utf8'
    )
    console.log(`${table}: ${rows.length}`)
  }

  const profileIds = new Set((tables.user_profiles || []).map((r) => r.user_id))
  const entitlementIds = new Set((tables.user_entitlements || []).map((r) => r.user_id))
  const entryIds = new Set((tables.symptom_entries || []).map((r) => r.user_id))
  const trackerUserIds = new Set([...profileIds, ...entitlementIds, ...entryIds])

  const allAuthUsers = await listAllAuthUsers(admin)
  const linkedAuthUsers = allAuthUsers
    .filter((u) => trackerUserIds.has(u.id))
    .map(sanitizeAuthUser)
    .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))

  await writeFile(
    path.join(outDir, 'auth_users_linked.json'),
    `${JSON.stringify(linkedAuthUsers, null, 2)}\n`,
    'utf8'
  )
  counts.auth_users_linked = linkedAuthUsers.length
  console.log(`auth_users_linked: ${linkedAuthUsers.length}`)

  const manifest = {
    exported_at: new Date().toISOString(),
    project_ref: 'bszlmqdqrwqocoxbzpyh',
    project_url: supabaseUrl,
    schema: 'tracker',
    note: 'Local PII backup. Do not commit. Not a full Postgres dump — table JSON + linked auth users only.',
    counts,
    files: [
      ...TRACKER_TABLES.map((t) => `${t}.json`),
      'auth_users_linked.json',
      'manifest.json'
    ]
  }

  await writeFile(
    path.join(outDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8'
  )

  console.log(`\nBackup written to ${outDir}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
