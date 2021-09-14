create table action_plan_session_appointment_pre_v1_78 as select * from action_plan_session_appointment;

with action_plans_to_modify as (
    with referrals_with_multiple_approved_aps as (
        select
            r.id referral_id
        from
            referral r
        where
            r.id in (
                    '05b1d52a-ae5c-49a6-8b4d-080a5101e79f',
                    'd2d72900-a5db-4711-a0ab-d48718f5af1d',
                    'd60d1343-2e3f-44cb-93d4-3280938e7824',
                    'da8edf26-d831-4b3d-bd00-9618ca4a9fa3',
                    '75d3a978-fefc-4252-84d1-45fa86d27b90',
                    '0be1d4f5-53a1-4e11-8c35-803774f67c7a'
                    )
    ),
         appointments_per_action_plan as (
             select
                 ap.referral_id,
                 ap.id action_plan_id,
                 ap.approved_at,
                 count(aps.id) session_count,
                 coalesce(count(appointment_id),0) appointment_count
             from
                 action_plan ap
                     inner join action_plan_session aps on aps.action_plan_id = ap.id
                     left join action_plan_session_appointment apsa on apsa.action_plan_session_id = aps.id
             where
                 ap.approved_at is not null
             group by
                 ap.referral_id,
                 ap.id,
                 ap.approved_at
         )
    select distinct
        rwm.referral_id,
        older_action_plan.action_plan_id older_action_plan_id,
        newer_action_plan.action_plan_id newer_action_plan_id
    from
        referrals_with_multiple_approved_aps rwm
            inner join appointments_per_action_plan older_action_plan on older_action_plan.referral_id = rwm.referral_id
            inner join appointments_per_action_plan newer_action_plan on newer_action_plan.referral_id = rwm.referral_id
    where
            older_action_plan.approved_at < newer_action_plan.approved_at
      and older_action_plan.appointment_count <= newer_action_plan.session_count
      and newer_action_plan.appointment_count = 0
      and older_action_plan.appointment_count > 0
)
update action_plan_session_appointment
set action_plan_session_id = new_action_plan_session.id
    from
        action_plans_to_modify
            inner join action_plan_session old_action_plan_session
                inner join action_plan_session_appointment old_appointments
on old_action_plan_session.id = old_appointments.action_plan_session_id
    on action_plans_to_modify.older_action_plan_id = old_action_plan_session.action_plan_id
    inner join action_plan_session new_action_plan_session
    on action_plans_to_modify.newer_action_plan_id = new_action_plan_session.action_plan_id
where
    old_action_plan_session.session_number = new_action_plan_session.session_number
  and action_plan_session_appointment.appointment_id = old_appointments.appointment_id;