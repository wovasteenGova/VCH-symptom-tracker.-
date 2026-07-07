#!/usr/bin/env node
/**
 * Export VCH Symptom Tracker users to exports/.
 *   node scripts/export-vch-users.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const exportsDir = path.join(rootDir, 'exports')

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.NUXT_SUPABASE_SERVICE_KEY
  || process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NUXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.')
  process.exit(1)
}

function csvEscape(value) {
  const text = value == null ? '' : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

function toSummaryCsv(users) {
  const header = [
    'email',
    'user_id',
    'profile_name',
    'auth_created_at',
    'last_sign_in_at',
    'email_confirmed',
    'auth_provider',
    'symptom_entry_count',
    'entitlement_product_key',
    'entitlement_status',
    'stripe_subscription_id',
    'tracked_condition_count',
    'log_reminders_enabled',
    'push_subscription_count'
  ]

  const rows = users.map((user) => [
    user.email,
    user.user_id,
    user.profile_name,
    user.auth_created_at,
    user.last_sign_in_at,
    user.email_confirmed_at ? 'yes' : 'no',
    user.auth_provider,
    user.symptom_entry_count,
    user.entitlement_product_key || '',
    user.entitlement_status || '',
    user.stripe_subscription_id || '',
    user.tracked_condition_count,
    user.log_reminders_enabled ? 'yes' : 'no',
    user.push_subscription_count
  ].map(csvEscape).join(','))

  return `${header.join(',')}\n${rows.join('\n')}\n`
}

async function listAllAuthUsers(adminClient) {
  const users = []
  let page = 1

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 })

    if (error) {
      throw error
    }

    users.push(...(data.users || []))

    if ((data.users || []).length < 200) {
      break
    }

    page += 1
  }

  return users
}

async function main() {
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const tracker = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'tracker' }
  })

  const [authUsers, profilesResult, entriesResult, pushResult, linksResult, entitlementsResult] = await Promise.all([
    listAllAuthUsers(admin),
    tracker.from('user_profiles').select('*'),
    tracker.from('symptom_entries').select('user_id'),
    tracker.from('push_subscriptions').select('user_id'),
    tracker.from('supporter_link_tokens').select('user_id'),
    tracker.from('user_entitlements').select('*')
  ])

  if (profilesResult.error) throw profilesResult.error
  if (entriesResult.error) throw entriesResult.error
  if (pushResult.error) throw pushResult.error
  if (linksResult.error) throw linksResult.error
  if (entitlementsResult.error) throw entitlementsResult.error

  const profilesByUserId = new Map((profilesResult.data || []).map((row) => [row.user_id, row]))
  const entryCounts = new Map()
  const pushCounts = new Map()
  const linkCounts = new Map()
  const entitlementsByUserId = new Map()

  for (const row of entriesResult.data || []) {
    entryCounts.set(row.user_id, (entryCounts.get(row.user_id) || 0) + 1)
  }

  for (const row of pushResult.data || []) {
    pushCounts.set(row.user_id, (pushCounts.get(row.user_id) || 0) + 1)
  }

  for (const row of linksResult.data || []) {
    linkCounts.set(row.user_id, (linkCounts.get(row.user_id) || 0) + 1)
  }

  for (const row of entitlementsResult.data || []) {
    const existing = entitlementsByUserId.get(row.user_id)
    if (!existing || String(row.updated_at || '') > String(existing.updated_at || '')) {
      entitlementsByUserId.set(row.user_id, row)
    }
  }

  const users = authUsers
    .map((authUser) => {
      const profile = profilesByUserId.get(authUser.id) || null
      const entitlement = entitlementsByUserId.get(authUser.id) || null
      const metadata = authUser.user_metadata || {}
      const appMetadata = authUser.app_metadata || {}

      return {
        user_id: authUser.id,
        email: authUser.email,
        phone: authUser.phone,
        auth_created_at: authUser.created_at,
        auth_updated_at: authUser.updated_at,
        email_confirmed_at: authUser.email_confirmed_at,
        last_sign_in_at: authUser.last_sign_in_at,
        confirmed_at: authUser.confirmed_at,
        is_anonymous: authUser.is_anonymous,
        auth_metadata: metadata,
        app_metadata: appMetadata,
        auth_provider: appMetadata.provider || appMetadata.providers?.[0] || null,
        profile_name: profile?.full_name || metadata.full_name || metadata.name || null,
        profile,
        symptom_entry_count: entryCounts.get(authUser.id) || 0,
        push_subscription_count: pushCounts.get(authUser.id) || 0,
        supporter_link_count: linkCounts.get(authUser.id) || 0,
        tracked_condition_count: Array.isArray(profile?.tracked_condition_keys)
          ? profile.tracked_condition_keys.length
          : 0,
        log_reminders_enabled: Boolean(profile?.log_reminders_enabled),
        entitlement_product_key: entitlement?.product_key || null,
        entitlement_status: entitlement?.status || null,
        entitlement_granted_by: entitlement?.granted_by || null,
        entitlement_grant_note: entitlement?.grant_note || null,
        stripe_customer_id: entitlement?.stripe_customer_id || null,
        stripe_subscription_id: entitlement?.stripe_subscription_id || null,
        entitlement
      }
    })
    .sort((a, b) => String(b.auth_created_at).localeCompare(String(a.auth_created_at)))

  const stamp = new Date().toISOString().slice(0, 10)
  await mkdir(exportsDir, { recursive: true })

  const payload = {
    exported_at: new Date().toISOString(),
    project_ref: 'bszlmqdqrwqocoxbzpyh',
    project_url: supabaseUrl,
    user_count: users.length,
    users
  }

  const jsonPath = path.join(exportsDir, `vch-users-${stamp}.json`)
  const csvPath = path.join(exportsDir, `vch-users-${stamp}-summary.csv`)

  await writeFile(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
  await writeFile(csvPath, toSummaryCsv(users), 'utf8')

  console.log(`Exported ${users.length} users`)
  console.log(jsonPath)
  console.log(csvPath)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
