-- Veteran service identity on tracker.user_profiles (shared with ClaimBuilder project settings).

alter table tracker.user_profiles
  add column if not exists date_of_birth date,
  add column if not exists service_branch text,
  add column if not exists service_rank text,
  add column if not exists service_start_year smallint
    check (service_start_year is null or (service_start_year >= 1940 and service_start_year <= 2100)),
  add column if not exists service_end_year smallint
    check (service_end_year is null or (service_end_year >= 1940 and service_end_year <= 2100)),
  add column if not exists phone text;

comment on column tracker.user_profiles.date_of_birth is 'Veteran DOB for claim packets and AI context.';
comment on column tracker.user_profiles.service_branch is 'Branch of service, e.g. U.S. Army.';
comment on column tracker.user_profiles.service_rank is 'Rank at separation or highest held.';
comment on column tracker.user_profiles.service_start_year is 'Year entered active service.';
comment on column tracker.user_profiles.service_end_year is 'Year separated from service.';
comment on column tracker.user_profiles.phone is 'Veteran contact phone number for claim packets and VA forms.';
