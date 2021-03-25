CREATE TYPE attended AS ENUM ('YES','LATE', 'NO');

alter table action_plan_appointment
    add column attended attended,
    add column additional_attendance_information text;

