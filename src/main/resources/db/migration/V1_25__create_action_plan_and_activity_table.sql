create table action_plan (
    id uuid not null,
    referral_id uuid not null,
    number_of_sessions int,
    created_by_id text not null,
    created_at timestamp with time zone not null,
    submitted_by_id text,
    submitted_at timestamp with time zone,
    approved_by_id text,
    approved_at timestamp with time zone,
    primary key (id),
    constraint fk_referral_id foreign key (referral_id) references referral,
    constraint fk_created_by_id foreign key (created_by_id) references auth_user,
    constraint fk_submitted_by_id foreign key (submitted_by_id) references auth_user,
    constraint fk_approved_by_id foreign key (approved_by_id) references auth_user
);

create table action_plan_activity (
    id uuid not null,
    action_plan_id uuid not null,
    desired_outcome_id uuid not null,
    description text not null,
    created_at timestamp with time zone not null,
    primary key (id),
    constraint fk_action_plan_id foreign key (action_plan_id) references action_plan,
    constraint fk_desired_outcome_id foreign key (desired_outcome_id) references desired_outcome
);

