create table referral (
    id uuid not null,
    created timestamp with time zone,
    completion_deadline date,
    primary key (id)
);
