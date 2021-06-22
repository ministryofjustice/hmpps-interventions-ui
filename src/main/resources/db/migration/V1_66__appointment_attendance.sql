alter table appointment
add column attendance_submitted_by_id text,

add constraint fk_attendance_submitted_by_id foreign key (attendance_submitted_by_id) references auth_user
