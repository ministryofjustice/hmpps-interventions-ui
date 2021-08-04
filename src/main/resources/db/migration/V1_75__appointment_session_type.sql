CREATE TYPE appointment_session_type AS ENUM ('ONE_TO_ONE','GROUP');

alter table appointment_delivery add column appointment_session_type appointment_session_type default 'ONE_TO_ONE';