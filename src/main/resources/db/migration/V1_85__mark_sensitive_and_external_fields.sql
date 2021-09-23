CREATE TABLE metadata
(
    table_name  text NOT NULL,
    column_name text NOT NULL,
    sensitive   bool NOT NULL
);

INSERT INTO metadata (table_name, column_name, sensitive)
SELECT table_name,
       column_name,
       FALSE
FROM information_schema.columns
WHERE table_schema = 'public';

UPDATE metadata
SET sensitive = TRUE
WHERE (table_name = 'referral_service_user_data'
    AND column_name != 'referral_id')
   OR (table_name = 'action_plan_activity'
    AND column_name = 'description')
   OR (table_name = 'appointment'
    AND column_name IN ('attendance_behaviour', 'additional_attendance_information'))
   OR (table_name = 'deprecated_action_plan_appointment'
    AND column_name IN ('attendance_behaviour', 'additional_attendance_information'))
   OR (table_name = 'case_note'
    AND column_name IN ('subject', 'body'))
   OR (table_name = 'end_of_service_report'
    AND column_name IN ('further_information'))
   OR (table_name = 'end_of_service_report_outcome'
    AND column_name IN ('additional_task_comments', 'progression_comments'))
   OR (table_name = 'referral'
    AND column_name IN
        ('accessibility_needs', 'additional_needs_information', 'draft_supplementary_risk', 'end_requested_comments',
         'further_information', 'interpreter_language', 'when_unavailable'));
