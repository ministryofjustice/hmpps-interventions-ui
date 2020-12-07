create table referral (
    id uuid not null,
    created timestamp with time zone,
    completion_deadline timestamp with time zone,
    primary key (id)
);
