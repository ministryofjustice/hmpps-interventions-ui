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
