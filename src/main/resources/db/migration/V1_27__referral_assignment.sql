alter table referral
    add column assigned_at timestamp with time zone,
    add column assigned_by_id text,
    add column assigned_to_id text,
    add constraint fk_assigned_by_id foreign key (assigned_by_id) references auth_user,
    add constraint fk_assigned_to_id foreign key (assigned_to_id) references auth_user;
