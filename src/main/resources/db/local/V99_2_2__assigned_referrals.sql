insert into referral (id, intervention_id, created_at, sent_at, sent_by_id, service_usercrn, completion_deadline, created_by_id, further_information, additional_needs_information, accessibility_needs, needs_interpreter, interpreter_language, has_additional_responsibilities, when_unavailable, draft_supplementary_risk, maximum_enforceable_days, reference_number, assigned_at, assigned_by_id, assigned_to_id, supplementary_risk_id)
values ('BBC2FEEE-2E86-4A33-8069-DD79A606B741', '08524319-7d5b-4b56-862a-bfe2c9a545f5', '2021-01-11 10:32:12.382884+00', '2021-01-14 15:56:45.382884+00', '2500099998', 'CRN24', '2021-04-01', '2500099998', 'Some information about the service user', 'Alex is currently sleeping on her aunt''s sofa', 'She uses a wheelchair', true, 'Spanish', true, 'She works Mondays 9am - midday', null, 10, 'EJ3892AC', '2021-02-18 10:32:12.382884+00', '6c4036b7-e87d-44fb-864f-5a06c1c492f3', '6c4036b7-e87d-44fb-864f-5a06c1c492f3', '5f2debc5-4c6a-4972-84ce-0689b8f9ec52'),
       ('B59D3599-0681-466A-82B2-F6F957E46190', '90e35306-5d65-4901-bb36-c4c44c7d19f9', '2021-03-10 16:49:34.235464+00', '2021-03-10 16:50:34.235464+00', '11', 'CRN25', '2022-01-01', '11', '', '', '', false, null, false, null, null, 5, 'GH3927AC', '2021-03-10 17:50:34.235464+00', '6c4036b7-e87d-44fb-864f-5a06c1c492f3', '608955ae-52ed-44cc-884c-011597a77949', '43d7a768-bfa8-4fbe-a466-5f2cdf89afd6'),
       ('a2a551aa-3d11-44b1-907b-42a028852bc1', 'f803445f-326c-4ef8-aee2-f7716d417832', '2021-04-22 09:00:00.000000+00', '2021-04-22 09:00:00.000000+00', '2500099998', 'CRN21', '2021-06-21', '2500099998', '', '', '', false, null, false, null, null, null, 'FH12376SO', '2021-04-22 09:00:00.000000+00', '6c4036b7-e87d-44fb-864f-5a06c1c492f3', '608955ae-52ed-44cc-884c-011597a77949', '122744b2-8e08-4a62-85ab-0b52cb4727ad');

insert into referral_selected_service_category(referral_id, service_category_id)
values ('BBC2FEEE-2E86-4A33-8069-DD79A606B741', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('B59D3599-0681-466A-82B2-F6F957E46190', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('a2a551aa-3d11-44b1-907b-42a028852bc1', '9556a399-3529-4993-8030-41db2090555e'),
       ('a2a551aa-3d11-44b1-907b-42a028852bc1', '8221a81c-08b2-4262-9c1a-0ab3c82cec8c');

insert into referral_complexity_level_ids(referral_id, complexity_level_ids, complexity_level_ids_key)
values ('BBC2FEEE-2E86-4A33-8069-DD79A606B741', 'd0db50b0-4a50-4fc7-a006-9c97530e38b2', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('B59D3599-0681-466A-82B2-F6F957E46190', 'd0db50b0-4a50-4fc7-a006-9c97530e38b2', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('a2a551aa-3d11-44b1-907b-42a028852bc1', '8e409327-e3ab-4c91-9300-2f61a409789f', '9556a399-3529-4993-8030-41db2090555e');

insert into referral_service_user_data (referral_id, disabilities, dob, ethnicity, title, first_name, last_name, preferred_language, religion_or_belief, gender)
values ('BBC2FEEE-2E86-4A33-8069-DD79A606B741', '{}', TO_DATE('2097-11-08', 'YYYY-MM-DD'), 'White British', 'Sir', 'ANDREW', 'DAVIES', 'Yupik', 'None', 'Male'),
       ('B59D3599-0681-466A-82B2-F6F957E46190', '{}', TO_DATE('2097-11-08', 'YYYY-MM-DD'), 'White British', 'Ms', 'JUNAID', 'KHAN', 'English', 'None', 'Female'),
       ('a2a551aa-3d11-44b1-907b-42a028852bc1', '{}', TO_DATE('2097-11-08', 'YYYY-MM-DD'), 'White British', 'Ms', 'JUNAID', 'KHAN', 'English', 'None', 'Female');

insert into supplier_assessment(id, referral_id)
values ('b8e25260-1f74-4f65-9891-dd4f9977d253', 'BBC2FEEE-2E86-4A33-8069-DD79A606B741'),
       ('3d7768f7-6cfa-4302-9b61-5a89300281db', 'B59D3599-0681-466A-82B2-F6F957E46190'),
       ('088e2fd0-abb2-40af-97d8-ceb6493644a5', 'a2a551aa-3d11-44b1-907b-42a028852bc1');

insert into action_plan (id, referral_id, number_of_sessions, created_by_id, created_at, submitted_by_id, submitted_at)
values ('21EA6AFE-C437-4018-9260-BF1A829DE464', 'BBC2FEEE-2E86-4A33-8069-DD79A606B741', 2, '608955ae-52ed-44cc-884c-011597a77949', '2021-03-10 17:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949', '2021-03-11 17:51:34.235464+00'),
       ('2EB8B0DB-EAF1-430A-BA69-39984D501EB9', 'B59D3599-0681-466A-82B2-F6F957E46190', 3, '608955ae-52ed-44cc-884c-011597a77949', '2021-03-10 17:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949', '2021-03-11 17:51:34.235464+00');

insert into appointment(id, appointment_time, duration_in_minutes, created_at, created_by_id)
values  ('1b79fba2-42ae-4acb-89ce-571e8ff10719', '2021-04-01 12:00:00.000000+00', 120, '2021-03-12 17:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949'),
        ('82e2fbbe-1bb4-4967-8ee6-81aa072fd44b' , '2021-04-07 12:00:00.000000+00', 120, '2021-03-12 18:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949');

insert into action_plan_session (id, action_plan_id, session_number)
values ('F6D6710F-8812-43D0-96F9-C0BDE9FF66F9', '21EA6AFE-C437-4018-9260-BF1A829DE464', 1),
       ('27597A9E-68CC-43AC-96DF-DE9B92F53524', '21EA6AFE-C437-4018-9260-BF1A829DE464', 2),
       ('847E253C-DC48-4914-9E5E-771694BB9C01', '2EB8B0DB-EAF1-430A-BA69-39984D501EB9', 1),
       ('7F8EBDFF-E127-475B-986F-635288CED216', '2EB8B0DB-EAF1-430A-BA69-39984D501EB9', 2),
       ('C6AA09D1-3BA2-4069-AFFB-1E9F98CDFF8D', '2EB8B0DB-EAF1-430A-BA69-39984D501EB9', 3);

insert into action_plan_session_appointment (action_plan_session_id, appointment_id)
values ('847E253C-DC48-4914-9E5E-771694BB9C01', '1b79fba2-42ae-4acb-89ce-571e8ff10719'),
       ('7F8EBDFF-E127-475B-986F-635288CED216', '82e2fbbe-1bb4-4967-8ee6-81aa072fd44b');

insert into end_of_service_report(id, referral_id, created_at, created_by_id, submitted_at, submitted_by_id, further_information)
values ('2cfcfa79-bb3c-484a-9428-85072e600812', 'a2a551aa-3d11-44b1-907b-42a028852bc1', '2021-04-22 09:00:00.000000+00', '608955ae-52ed-44cc-884c-011597a77949', null, null, null);
