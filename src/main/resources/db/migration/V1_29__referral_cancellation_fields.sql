alter table referral
    add column cancelled_at timestamp with time zone,
    add column cancelled_by_id text,
    add constraint fk_cancelled_by_id foreign key (cancelled_by_id) references auth_user;