CREATE TYPE appointment_delivery_type AS ENUM ('PHONE_CALL','VIDEO_CALL', 'IN_PERSON_MEETING_PROBATION_OFFICE', 'IN_PERSON_MEETING_OTHER');

create table appointment_delivery(
    appointment_id uuid not null,
    appointment_delivery_type appointment_delivery_type not null,
    nps_office_code VARCHAR(7) null,
    video_call_url text null,
    constraint pk_appointment_delivery_appointment_id primary key (appointment_id),
    constraint fk_appointment_delivery_to_appointment foreign key(appointment_id) references appointment
);

create table appointment_delivery_address(
     appointment_delivery_id uuid not null,
     first_address_line text not null,
     second_address_line text null,
     town_city text not null,
     county text not null,
     post_code VARCHAR(8) not null,
     constraint pk_appointment_delivery_address_appointment_delivery_id primary key (appointment_delivery_id),
     constraint fk_appointment_delivery_address_to_appointment_delivery foreign key(appointment_delivery_id) references appointment_delivery
);