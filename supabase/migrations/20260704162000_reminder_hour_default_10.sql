-- Default log reminder hour 10 (better for sleep / late wakeups). Existing rows unchanged.
alter table tracker.user_profiles
  alter column reminder_hour set default 10;
