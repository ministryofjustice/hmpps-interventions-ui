create table action_plan_appointment (
    id uuid not null,
    action_plan_id uuid not null,
    session_number int not null,
    appointment_time timestamp with time zone null,
    duration_in_minutes int null,
    created_at timestamp with time zone not null,
    created_by_id text not null,
	constraint pk_action_plan_appt_id primary key (id),
    constraint fk_action_plan_appt_to_plan_id foreign key (action_plan_id) references action_plan,
    constraint fk_action_plan_appt_to_created_by foreign key (created_by_id) references auth_user
);

create unique index idx_action_plan_appt_key on action_plan_appointment (action_plan_id, session_number);