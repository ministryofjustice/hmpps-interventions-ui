alter table appointment
    add column referral_id UUID,
    add constraint fk__appointment__referral foreign key (referral_id) references referral;

Update appointment apo
set referral_id = (
    select ref.id
    from referral ref
             inner join action_plan act on ref.id = act.referral_id
             inner join action_plan_session aps on aps.action_plan_id = act.id
             inner join action_plan_session_appointment apsa on apsa.action_plan_session_id = aps.id
             inner join appointment app on app.id = apsa.appointment_id
    where app.id = apo.id
);

Update appointment apo
set referral_id = (
    select ref.id
    from referral ref
             inner join supplier_assessment sup on sup.referral_id = ref.id
             inner join supplier_assessment_appointment saa on saa.supplier_assessment_id = sup.id
             inner join appointment app on app.id = saa.appointment_id
    where app.id = apo.id
)
where apo.referral_id is null;
