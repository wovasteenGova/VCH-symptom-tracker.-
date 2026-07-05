-- Grant comped Pro to philippeashelton@gmail.com on VCH (bszlmqdqrwqocoxbzpyh).
-- Safe to re-run: upserts on (user_id, product_key).

insert into tracker.user_entitlements (
  user_id,
  product_key,
  status,
  granted_by,
  grant_note,
  unlocked_at,
  updated_at
)
select
  id,
  'symptom_tracker_pro',
  'comped',
  'manual',
  'Comped Pro for philippeashelton@gmail.com',
  now(),
  now()
from auth.users
where lower(email) = lower('philippeashelton@gmail.com')
on conflict (user_id, product_key) do update
set
  status = excluded.status,
  granted_by = excluded.granted_by,
  grant_note = excluded.grant_note,
  updated_at = excluded.updated_at;
