BEGIN;

    drop view delivery_session;
    drop view delivery_session_appointment;

    create table delivery_session as
    select id, referral_id, session_number from action_plan_session
    where latest_approved = true;

    alter table delivery_session add constraint pk_delivery_session primary key (id);
    alter table delivery_session add constraint fk_delivery_session_referral foreign key (referral_id) references referral;
    alter table delivery_session add constraint bk_delivery_session unique (referral_id, session_number);

    create index idx_referral__id on delivery_session (referral_id);

    create table delivery_session_appointment as
    select action_plan_session_id delivery_session_id, appointment_id from action_plan_session_appointment apsa
    inner join delivery_session ds on ds.id = apsa.action_plan_session_id;

    alter table delivery_session_appointment
        add constraint uk_delivery_session_appointments_appointments_id unique (appointments_id),
    alter table delivery_session_appointment
        add constraint pk_delivery_session_appointment primary key (delivery_session_id, appointment_id);
    alter table delivery_session_appointment
        add constraint fk_delivery_session_appointment_delivery_session foreign key (delivery_session_id) references delivery_session;
    alter table delivery_session_appointment
        add constraint fk_delivery_session_appointment_appointment foreign key (appointment_id) references appointment;

COMMIT;
