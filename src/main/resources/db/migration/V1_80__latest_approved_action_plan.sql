/*
    We do not need to worry about non-approved action plans as the session table will only contain sessions for approved action plans.
    Add a new column (_latest_approved_) to every action plan session which denotes if this session belongs to the latest approved action plan
    Select all approved action plans grouped by referral id and order them according to approval date. This allows us to easily select the most recently approved action plan for a given referral.
    Update every action plan session setting _latest_approved_ to true for sessions associated with the most recently approved action plan.
    Create views of action plan sessions with their id, referral id and session number so we can refer to these as _delivery_session_
    Create views of action plan session appointments in a similar fashion.
*/

BEGIN;
alter table action_plan_session add column latest_approved boolean not null default true;

with action_plans_ranked_by_approved_at_desc as (
    select id,
           referral_id,
           approved_at,
           row_number() over (partition by referral_id order by approved_at desc) rank
    from action_plan ap
    where approved_at is not null
)
update action_plan_session aps
set latest_approved = case when apr.rank = 1 then true else false end
from action_plans_ranked_by_approved_at_desc apr
where aps.action_plan_id = apr.id;

create view delivery_session as
select id, referral_id, session_number
from action_plan_session
where latest_approved = true;

create view delivery_session_appointment as
select action_plan_session_id delivery_session_id, appointment_id
from action_plan_session_appointment;

COMMIT;
