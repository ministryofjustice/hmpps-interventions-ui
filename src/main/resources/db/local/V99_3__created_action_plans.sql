insert into action_plan (id, referral_id, number_of_sessions, created_by_id, created_at, submitted_by_id, submitted_at)
values ('700754aa-d868-4347-9c0f-50690773014e', '81d754aa-d868-4347-9c0f-50690773014e', 3, '8751622134', '2020-12-07 18:02:01.599803+00', null, null);

insert into action_plan_activity (id, desired_outcome_id, description, created_at)
values ('700754aa-d868-4347-9c0f-50690773014e', '301ead30-30a4-4c7c-8296-2768abfb59b5', 'Identify any outstanding anger management barriers', '2020-12-07 18:02:02.599803+00'),
       ('700754aa-d868-4347-9c0f-50690773014e', '65924ac6-9724-455b-ad30-906936291421', 'Identifying users approach to finding accommodation', '2020-12-07 18:02:03.599803+00'),
       ('700754aa-d868-4347-9c0f-50690773014e', '65924ac6-9724-455b-ad30-906936291421', 'Formulating plan for finding suitable digs', '2020-12-07 18:02:04.599803+00');
