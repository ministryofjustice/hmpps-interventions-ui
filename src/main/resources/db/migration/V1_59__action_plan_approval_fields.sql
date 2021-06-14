alter table action_plan
    add column approved_at timestamp with time zone,
    add column approved_by_id text,
    add constraint fk_action_plan_approved_by foreign key (approved_by_id) references auth_user;

alter table action_plan_session
    add unique (action_plan_id, session_number);