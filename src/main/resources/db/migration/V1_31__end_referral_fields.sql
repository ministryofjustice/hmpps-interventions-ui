alter table referral
    add column ended_at timestamp with time zone,
    add column ended_by_id text,
    add constraint fk_ended_by_id foreign key (ended_by_id) references auth_user;