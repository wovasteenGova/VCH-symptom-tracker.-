-- Grant comped Pro (1 year) to early Symptom Tracker beta users on VCH.
-- Skips accounts with an active paid Stripe subscription (do not overwrite).
-- Safe to re-run: upserts on (user_id, product_key).

insert into tracker.user_entitlements (
  user_id,
  product_key,
  status,
  granted_by,
  grant_note,
  current_period_end,
  unlocked_at,
  updated_at
)
select
  u.id,
  'symptom_tracker_pro',
  'comped',
  'manual',
  'Beta thank-you — free Pro for 1 year',
  now() + interval '1 year',
  now(),
  now()
from auth.users u
where not exists (
  select 1
  from tracker.user_entitlements e
  where e.user_id = u.id
    and e.product_key = 'symptom_tracker_pro'
    and e.status = 'active'
    and e.stripe_subscription_id is not null
)
on conflict (user_id, product_key) do update
set
  status = excluded.status,
  granted_by = excluded.granted_by,
  grant_note = excluded.grant_note,
  current_period_end = excluded.current_period_end,
  unlocked_at = coalesce(tracker.user_entitlements.unlocked_at, excluded.unlocked_at),
  updated_at = excluded.updated_at
where tracker.user_entitlements.stripe_subscription_id is null;
