-- Tracker schema reference (VCH project bszlmqdqrwqocoxbzpyh).
-- Authoritative DDL: supabase/migrations/

-- Core
--   tracker.user_profiles          — profile, conditions, cadence, reminders
--   tracker.symptom_entries        — veteran + family logs (family → details jsonb)
--   tracker.symptom_entry_drafts   — in-progress entry drafts
--   tracker.user_entitlements      — Pro (Stripe or comped)

-- Family links
--   tracker.supporter_profiles     — link config + initial token_hash
--   tracker.supporter_link_tokens  — rotated / re-copied link tokens

-- Push reminders (optional feature)
--   tracker.push_subscriptions
--   tracker.log_reminder_deliveries

-- RPC: get_supporter_profile_by_token, submit_supporter_observation
