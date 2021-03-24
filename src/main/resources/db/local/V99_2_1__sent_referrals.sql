insert into referral (id, intervention_id, created_at, sent_at, sent_by_id, service_usercrn, completion_deadline, created_by_id, further_information, additional_needs_information, accessibility_needs, needs_interpreter, interpreter_language, has_additional_responsibilities, when_unavailable, additional_risk_information, using_rar_days, maximum_rar_days, complexity_levelid, reference_number)
values ('81d754aa-d868-4347-9c0f-50690773014e', '98a42c61-c30f-4beb-8062-04033c376e2d', '2021-01-11 10:32:12.382884+00', '2021-01-14 15:56:45.382884+00', '2500099998', 'CRN23', '2021-04-01', '2500099998', 'Some information about the service user', 'Alex is currently sleeping on her aunt''s sofa', 'She uses a wheelchair', true, 'Spanish', true, 'She works Mondays 9am - midday', 'A danger to the elderly', true, 10, 'd0db50b0-4a50-4fc7-a006-9c97530e38b2', 'HD2123AC');

insert into referral_service_user_data (referral_id, disabilities, dob, ethnicity, title, first_name, last_name, preferred_language, religion_or_belief, gender)
values ('81d754aa-d868-4347-9c0f-50690773014e', '{Autism spectrum condition, sciatica}', TO_DATE('2097-11-08', 'YYYY-MM-DD'), 'British', 'Mrs', 'STEVE', 'MCDONALD', 'English', 'Agnostic', 'Female');

insert into referral_desired_outcome (referral_id, desired_outcome_id)
values ('81d754aa-d868-4347-9c0f-50690773014e', '301ead30-30a4-4c7c-8296-2768abfb59b5'),
       ('81d754aa-d868-4347-9c0f-50690773014e', '65924ac6-9724-455b-ad30-906936291421');
