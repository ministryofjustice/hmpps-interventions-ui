CREATE TYPE attended AS ENUM ('YES','LATE', 'NO');

alter table action_plan_appointment
    add column attended attended,
    add column additional_attendance_information text,
    add column attendance_submitted_at timestamp with time zone;
