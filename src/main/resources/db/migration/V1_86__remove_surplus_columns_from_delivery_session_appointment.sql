-- This is to remove accidently added columns in the v1_84.
alter table delivery_session_appointment
    drop column id;

alter table delivery_session_appointment
    drop column session_number;

alter table delivery_session_appointment
    drop column referral_id;
