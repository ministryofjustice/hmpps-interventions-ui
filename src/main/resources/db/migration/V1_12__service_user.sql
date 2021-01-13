create table service_user (
    referral_id uuid not null unique,
    address text,
    crn text,
    disabilities text,
    dob date,
    ethnicity text,
    first_name text,
    last_name text,
    needs text,
    nomis_number text,
    other_names text,
    pnc_number text,
    preferred_language text,
    religion_or_belief text,
    sex text,
    sexual_orientation text,
    title text,
    primary key (referral_id)
);

alter table service_user
    add constraint fk_referral_id foreign key (referral_id) references referral;
