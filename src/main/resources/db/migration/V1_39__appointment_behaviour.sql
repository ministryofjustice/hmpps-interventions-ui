alter table action_plan_appointment
    add column attendance_behaviour text,
    add column notifyppof_attendance_behaviour boolean,
    add column attendance_behaviour_submitted_at timestamp with time zone;
