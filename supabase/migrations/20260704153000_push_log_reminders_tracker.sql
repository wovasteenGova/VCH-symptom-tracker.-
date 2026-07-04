-- Push log reminders for the VCH symptom tracker (tracker schema).
-- Run this in the Supabase SQL editor on the project your app uses
-- (check SUPABASE_URL in .env — expected ref: bszlmqdqrwqocoxbzpyh).

alter table tracker.user_profiles
  add column if not exists log_reminders_enabled boolean not null default false,
  add column if not exists reminder_hour smallint not null default 9;

alter table tracker.user_profiles
  drop constraint if exists user_profiles_reminder_hour_check;

alter table tracker.user_profiles
  add constraint user_profiles_reminder_hour_check
  check (reminder_hour between 0 and 23);

create table if not exists tracker.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth_key text not null,
  user_agent text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

create table if not exists tracker.log_reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dedupe_key text not null,
  sent_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);

create index if not exists push_subscriptions_user_enabled_idx
  on tracker.push_subscriptions (user_id, enabled);

create index if not exists log_reminder_deliveries_user_sent_idx
  on tracker.log_reminder_deliveries (user_id, sent_at desc);

alter table tracker.push_subscriptions enable row level security;
alter table tracker.log_reminder_deliveries enable row level security;

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

drop policy if exists "Users can view their reminder deliveries" on tracker.log_reminder_deliveries;
create policy "Users can view their reminder deliveries"
  on tracker.log_reminder_deliveries
  for select
  using (auth.uid() = user_id);

comment on table tracker.push_subscriptions is
  'Web Push endpoints per device. Used by scheduled reminder jobs.';

comment on table tracker.log_reminder_deliveries is
  'Server-side dedupe so daily/weekly reminders are not sent twice.';
