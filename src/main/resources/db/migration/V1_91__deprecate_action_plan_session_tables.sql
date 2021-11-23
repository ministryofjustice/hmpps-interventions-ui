ALTER TABLE action_plan_session
RENAME TO deprecated_action_plan_session;

ALTER TABLE action_plan_session_appointment
RENAME TO deprecated_action_plan_session_appointment;

update metadata
set table_name = 'deprecated_action_plan_session'
where table_name = 'action_plan_session';

update metadata
set table_name = 'deprecated_action_plan_session_appointment'
where table_name = 'action_plan_session_appointment'
