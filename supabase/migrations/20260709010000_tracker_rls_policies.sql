-- Version tracker RLS policies in git and close small grant/policy gaps.
-- Safe / idempotent. No data deletes. Service role keeps full access for Stripe + cron.

-- ---------------------------------------------------------------------------
-- A. Ensure RLS is on
-- ---------------------------------------------------------------------------
alter table tracker.user_profiles enable row level security;
alter table tracker.symptom_entries enable row level security;
alter table tracker.symptom_entry_drafts enable row level security;
alter table tracker.user_entitlements enable row level security;
alter table tracker.supporter_profiles enable row level security;
alter table tracker.supporter_link_tokens enable row level security;
alter table tracker.push_subscriptions enable row level security;
alter table tracker.log_reminder_deliveries enable row level security;

-- ---------------------------------------------------------------------------
-- B. Owner-scoped policies (recreate idempotently)
-- ---------------------------------------------------------------------------

-- user_profiles: SELECT / INSERT / UPDATE (no DELETE — profiles are permanent)
drop policy if exists "Users can view their profile" on tracker.user_profiles;
create policy "Users can view their profile"
  on tracker.user_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their profile" on tracker.user_profiles;
create policy "Users can insert their profile"
  on tracker.user_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their profile" on tracker.user_profiles;
create policy "Users can update their profile"
  on tracker.user_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- symptom_entries: full CRUD for owner
drop policy if exists "Users can view their symptom entries" on tracker.symptom_entries;
create policy "Users can view their symptom entries"
  on tracker.symptom_entries
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their symptom entries" on tracker.symptom_entries;
create policy "Users can insert their symptom entries"
  on tracker.symptom_entries
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their symptom entries" on tracker.symptom_entries;
create policy "Users can update their symptom entries"
  on tracker.symptom_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their symptom entries" on tracker.symptom_entries;
create policy "Users can delete their symptom entries"
  on tracker.symptom_entries
  for delete
  using (auth.uid() = user_id);

-- symptom_entry_drafts: full CRUD for owner
drop policy if exists "Users can view their symptom drafts" on tracker.symptom_entry_drafts;
create policy "Users can view their symptom drafts"
  on tracker.symptom_entry_drafts
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their symptom drafts" on tracker.symptom_entry_drafts;
create policy "Users can insert their symptom drafts"
  on tracker.symptom_entry_drafts
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their symptom drafts" on tracker.symptom_entry_drafts;
create policy "Users can update their symptom drafts"
  on tracker.symptom_entry_drafts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their symptom drafts" on tracker.symptom_entry_drafts;
create policy "Users can delete their symptom drafts"
  on tracker.symptom_entry_drafts
  for delete
  using (auth.uid() = user_id);

-- user_entitlements: SELECT only (writes via service role / Stripe)
drop policy if exists "Users can read own entitlements" on tracker.user_entitlements;
create policy "Users can read own entitlements"
  on tracker.user_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

-- supporter_profiles: full CRUD for owner
drop policy if exists "Users can view their supporter profiles" on tracker.supporter_profiles;
create policy "Users can view their supporter profiles"
  on tracker.supporter_profiles
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their supporter profiles" on tracker.supporter_profiles;
create policy "Users can insert their supporter profiles"
  on tracker.supporter_profiles
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their supporter profiles" on tracker.supporter_profiles;
create policy "Users can update their supporter profiles"
  on tracker.supporter_profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their supporter profiles" on tracker.supporter_profiles;
create policy "Users can delete their supporter profiles"
  on tracker.supporter_profiles
  for delete
  using (auth.uid() = user_id);

-- supporter_link_tokens: full CRUD for owner (adds missing UPDATE / DELETE)
drop policy if exists "Users can view supporter link tokens" on tracker.supporter_link_tokens;
create policy "Users can view supporter link tokens"
  on tracker.supporter_link_tokens
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create supporter link tokens" on tracker.supporter_link_tokens;
create policy "Users can create supporter link tokens"
  on tracker.supporter_link_tokens
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update supporter link tokens" on tracker.supporter_link_tokens;
create policy "Users can update supporter link tokens"
  on tracker.supporter_link_tokens
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete supporter link tokens" on tracker.supporter_link_tokens;
create policy "Users can delete supporter link tokens"
  on tracker.supporter_link_tokens
  for delete
  using (auth.uid() = user_id);

-- push_subscriptions: full CRUD for owner
drop policy if exists "Users can view their push subscriptions" on tracker.push_subscriptions;
create policy "Users can view their push subscriptions"
  on tracker.push_subscriptions
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their push subscriptions" on tracker.push_subscriptions;
create policy "Users can insert their push subscriptions"
  on tracker.push_subscriptions
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their push subscriptions" on tracker.push_subscriptions;
create policy "Users can update their push subscriptions"
  on tracker.push_subscriptions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their push subscriptions" on tracker.push_subscriptions;
create policy "Users can delete their push subscriptions"
  on tracker.push_subscriptions
  for delete
  using (auth.uid() = user_id);

-- log_reminder_deliveries: SELECT only (writes via service role / cron)
drop policy if exists "Users can view their reminder deliveries" on tracker.log_reminder_deliveries;
create policy "Users can view their reminder deliveries"
  on tracker.log_reminder_deliveries
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- C. Tighten table grants (defense in depth; service_role unchanged)
-- ---------------------------------------------------------------------------
revoke all on table tracker.user_entitlements from authenticated;
grant select on table tracker.user_entitlements to authenticated;

revoke insert, update, delete on table tracker.log_reminder_deliveries from authenticated;
grant select on table tracker.log_reminder_deliveries to authenticated;

revoke delete on table tracker.user_profiles from authenticated;

-- ---------------------------------------------------------------------------
-- D. Tighten function EXECUTE (supporter RPCs stay public for family form)
-- ---------------------------------------------------------------------------
revoke execute on function tracker.handle_new_user() from public, anon, authenticated;
revoke execute on function tracker.legacy_user_id(uuid) from public, anon, authenticated;

-- Fix mutable search_path on legacy_user_id (advisor warning)
create or replace function tracker.legacy_user_id(old_id uuid)
returns uuid
language sql
immutable
set search_path to 'tracker', 'public'
as $function$
  select case old_id
    when '21f9752f-2882-471b-8694-365da66b96ae'::uuid then '2b8bb522-414d-441c-bf76-075514bb0d95'::uuid
    when 'b56a4c81-770b-4755-870d-a9b25d6530a3'::uuid then '4e536bee-9959-4f3f-9c66-800719bb9627'::uuid
    when '65fe9478-1ec4-43a1-81a6-a0b47a6dba3d'::uuid then 'de21f5bd-854f-4597-a9c5-215baa8e7719'::uuid
    when 'befca45c-127b-490d-8eda-bb1f2d2a4b90'::uuid then 'befca45c-127b-490d-8eda-bb1f2d2a4b90'::uuid
    else old_id
  end;
$function$;

revoke execute on function tracker.legacy_user_id(uuid) from public, anon, authenticated;
