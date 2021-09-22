alter table action_plan_session
    rename column action_plan_id to deprecated_action_plan_id;

alter table action_plan_session
    alter column deprecated_action_plan_id drop not null;

-- alter table action_plan_session
--     drop constraint fk_action_plan_session_action_plan;