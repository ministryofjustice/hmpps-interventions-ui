alter table referral
    add column service_usercrn text not null default 'unknown';

create table referral_service_user_data (
    referral_id uuid not null unique,
    nomis_number text,
    pnc_number text,
    address text,
    disabilities text,
    dob date,
    ethnicity text,
    first_name text,
    last_name text,
    needs text,
    other_names text,
    preferred_language text,
    religion_or_belief text,
    sex text,
    sexual_orientation text,
    title text,
    primary key (referral_id)
);

alter table referral_service_user_data
    add constraint fk_referral_id foreign key (referral_id) references referral;
