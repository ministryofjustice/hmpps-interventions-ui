BEGIN;
    alter view delivery_session rename to delivery_session_deprecated;
    alter view delivery_session_appointment rename to delivery_session_appointment_deprecated;

    create table delivery_session as
    select * from delivery_session_deprecated;

    alter table delivery_session add constraint pk_delivery_session primary key (id);
    alter table delivery_session add constraint fk_delivery_session_referral foreign key (referral_id) references referral;
    alter table delivery_session add constraint bk_delivery_session unique (referral_id, session_number);

    create index idx_delivery_session_referral__id on delivery_session (referral_id);

    create table delivery_session_appointment as
    select * from delivery_session_appointment_deprecated;

    alter table delivery_session_appointment
        add constraint uk_delivery_session_appointments_appointment_id unique (appointment_id);
    alter table delivery_session_appointment
        add constraint pk_delivery_session_appointment primary key (delivery_session_id, appointment_id);
    alter table delivery_session_appointment
        add constraint fk_delivery_session_appointment_delivery_session foreign key (delivery_session_id) references delivery_session;
    alter table delivery_session_appointment
        add constraint fk_delivery_session_appointment_appointment foreign key (appointment_id) references appointment;

    create index idx_delivery_session_appointment_delivery_session__id on delivery_session_appointment (delivery_session_id);
    create index idx_delivery_session_appointment_appointment__id on delivery_session_appointment (appointment_id);
COMMIT;
