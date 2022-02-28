CREATE TABLE referral_details(
    id uuid not null,
    superseded_by_id uuid unique,
    created_at timestamp with time zone not null,
    created_by text not null,
    reason_for_change text,
    referral_id uuid not null,
    completion_deadline date,
    further_information text,
    maximum_enforceable_days int,

    primary key(id),
    foreign key (superseded_by_id) references referral_details(id)
);
