-- Evening log reminder hour (local time in reminder_timezone).
alter table tracker.user_profiles
  add column if not exists reminder_evening_hour smallint not null default 20;

alter table tracker.user_profiles
  drop constraint if exists user_profiles_reminder_evening_hour_check;

alter table tracker.user_profiles
  add constraint user_profiles_reminder_evening_hour_check
  check (reminder_evening_hour between 0 and 23);

comment on column tracker.user_profiles.reminder_evening_hour is
  'Local hour (0-23) for the second daily log reminder, default 8pm.';
