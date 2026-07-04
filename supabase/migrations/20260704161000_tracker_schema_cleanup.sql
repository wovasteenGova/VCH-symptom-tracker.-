-- Tracker schema cleanup: remove unused legacy tables/columns.
-- Family reports are stored as tracker.symptom_entries (source = family) via submit_supporter_observation().

drop table if exists tracker.supporter_observations cascade;

alter table tracker.supporter_profiles
  drop column if exists first_name,
  drop column if exists last_name,
  drop column if exists email,
  drop column if exists phone,
  drop column if exists relationship;

comment on table tracker.supporter_profiles is
  'Shareable family-report links. Initial token on token_hash; rotated tokens in supporter_link_tokens.';

comment on table tracker.supporter_link_tokens is
  'Additional or rotated private link tokens for a supporter profile.';

comment on table tracker.symptom_entries is
  'Veteran and family symptom logs. Family submissions use source = family with reporter fields in details jsonb.';

comment on table tracker.user_entitlements is
  'Pro access: Stripe subscription (active/past_due/canceled) or manual comped grants.';

comment on table tracker.user_profiles is
  'App profile per auth user: display name, tracked conditions, logging cadence, onboarding flags.';
