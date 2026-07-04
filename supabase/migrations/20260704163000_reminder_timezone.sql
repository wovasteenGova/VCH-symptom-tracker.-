-- Store IANA timezone for reminder hour (user local time).
alter table tracker.user_profiles
  add column if not exists reminder_timezone text;

comment on column tracker.user_profiles.reminder_timezone is
  'IANA timezone for log reminder hour, e.g. America/Chicago';
