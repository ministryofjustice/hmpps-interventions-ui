create table appointment(
    id uuid not null,
    appointment_time timestamp with time zone not null,
    duration_in_minutes int not null,
    created_at timestamp with time zone not null,
    created_by_id text not null,

    attended attended,
    additional_attendance_information text,
    attendance_submitted_at timestamp with time zone,

    attendance_behaviour text,
    notifyppof_attendance_behaviour boolean,
    attendance_behaviour_submitted_at timestamp with time zone,

    appointment_feedback_submitted_at timestamp with time zone,
    appointment_feedback_submitted_by_id text,
    delius_appointment_id bigint,

    constraint pk_appt_id primary key (id),
    constraint fk_appt_to_created_by foreign key (created_by_id) references auth_user,
    constraint fk_feedback_submitted_by foreign key (appointment_feedback_submitted_by_id) references auth_user
);
