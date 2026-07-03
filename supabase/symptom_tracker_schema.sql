-- Symptom Tracker schema for the shared VCH Supabase project.
-- Tables live in the `tracker` schema so they stay grouped separately from hub content.

create table if not exists public.symptom_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  condition_key text not null,
  condition_label text not null,
  source text not null default 'veteran' check (source in ('veteran', 'family')),
  entry_status text not null default 'complete' check (entry_status in ('draft', 'complete')),
  severity integer check (severity between 0 and 10),
  occurred_at timestamptz,
  summary text,
  impact text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.symptom_entry_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  condition_key text not null,
  condition_label text not null,
  current_step integer not null default 0,
  draft_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.symptom_entries enable row level security;
alter table public.symptom_entry_drafts enable row level security;

create policy "Users can view their symptom entries"
  on public.symptom_entries
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their symptom entries"
  on public.symptom_entries
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their symptom entries"
  on public.symptom_entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their symptom entries"
  on public.symptom_entries
  for delete
  using (auth.uid() = user_id);

create policy "Users can view their symptom drafts"
  on public.symptom_entry_drafts
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their symptom drafts"
  on public.symptom_entry_drafts
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their symptom drafts"
  on public.symptom_entry_drafts
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their symptom drafts"
  on public.symptom_entry_drafts
  for delete
  using (auth.uid() = user_id);

create index if not exists symptom_entries_user_occurred_at_idx
  on public.symptom_entries (user_id, occurred_at desc);

create index if not exists symptom_entries_user_condition_idx
  on public.symptom_entries (user_id, condition_key);

create index if not exists symptom_entry_drafts_user_updated_at_idx
  on public.symptom_entry_drafts (user_id, updated_at desc);
