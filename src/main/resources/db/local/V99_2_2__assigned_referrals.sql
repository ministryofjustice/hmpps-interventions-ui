insert into referral (id, intervention_id, created_at, sent_at, sent_by_id, service_usercrn, completion_deadline, created_by_id, further_information, additional_needs_information, accessibility_needs, needs_interpreter, interpreter_language, has_additional_responsibilities, when_unavailable, additional_risk_information, using_rar_days, maximum_rar_days, complexity_levelid, reference_number, assigned_at, assigned_by_id, assigned_to_id)
values ('BBC2FEEE-2E86-4A33-8069-DD79A606B741', '08524319-7d5b-4b56-862a-bfe2c9a545f5', '2021-01-11 10:32:12.382884+00', '2021-01-14 15:56:45.382884+00', '2500099998', 'CRN24', '2021-04-01', '2500099998', 'Some information about the service user', 'Alex is currently sleeping on her aunt''s sofa', 'She uses a wheelchair', true, 'Spanish', true, 'She works Mondays 9am - midday', 'A danger to the elderly', true, 10, 'd0db50b0-4a50-4fc7-a006-9c97530e38b2', 'EJ3892AC', '2021-02-18 10:32:12.382884+00', '6c4036b7-e87d-44fb-864f-5a06c1c492f3', '6c4036b7-e87d-44fb-864f-5a06c1c492f3'),
       ('B59D3599-0681-466A-82B2-F6F957E46190', '90e35306-5d65-4901-bb36-c4c44c7d19f9', '2021-03-10 16:49:34.235464+00', '2021-03-10 16:50:34.235464+00', '11', 'CRN25', '2022-01-01', '11', '', '', '', false, null, false, null, '', true, 5, 'd0db50b0-4a50-4fc7-a006-9c97530e38b2', 'GH3927AC', '2021-03-10 17:50:34.235464+00', '6c4036b7-e87d-44fb-864f-5a06c1c492f3', '608955ae-52ed-44cc-884c-011597a77949');

insert into referral_service_user_data (referral_id, disabilities, dob, ethnicity, title, first_name, last_name, preferred_language, religion_or_belief, gender)
values ('BBC2FEEE-2E86-4A33-8069-DD79A606B741', '{}', TO_DATE('2097-11-08', 'YYYY-MM-DD'), 'White British', 'Sir', 'ANDREW', 'DAVIES', 'Yupik', 'None', 'Male'),
       ('B59D3599-0681-466A-82B2-F6F957E46190', '{}', TO_DATE('2097-11-08', 'YYYY-MM-DD'), 'White British', 'Ms', 'JUNAID', 'KHAN', 'English', 'None', 'Female');


insert into action_plan (id, referral_id, number_of_sessions, created_by_id, created_at, submitted_by_id, submitted_at)
values ('21EA6AFE-C437-4018-9260-BF1A829DE464', 'BBC2FEEE-2E86-4A33-8069-DD79A606B741', 2, '608955ae-52ed-44cc-884c-011597a77949', '2021-03-10 17:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949', '2021-03-11 17:51:34.235464+00'),
       ('2EB8B0DB-EAF1-430A-BA69-39984D501EB9', 'B59D3599-0681-466A-82B2-F6F957E46190', 3, '608955ae-52ed-44cc-884c-011597a77949', '2021-03-10 17:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949', '2021-03-11 17:51:34.235464+00');

insert into action_plan_appointment (id, action_plan_id, session_number, appointment_time, duration_in_minutes, created_at, created_by_id)
values ('F6D6710F-8812-43D0-96F9-C0BDE9FF66F9', '21EA6AFE-C437-4018-9260-BF1A829DE464', 1, null, null, '2021-03-12 17:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949'),
       ('27597A9E-68CC-43AC-96DF-DE9B92F53524', '21EA6AFE-C437-4018-9260-BF1A829DE464', 2, null, null, '2021-03-12 18:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949'),
       ('847E253C-DC48-4914-9E5E-771694BB9C01', '2EB8B0DB-EAF1-430A-BA69-39984D501EB9', 1, '2021-04-01 12:00:00.000000+00', 120, '2021-03-12 17:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949'),
       ('7F8EBDFF-E127-475B-986F-635288CED216', '2EB8B0DB-EAF1-430A-BA69-39984D501EB9', 2, '2021-04-07 12:00:00.000000+00', 120, '2021-03-12 18:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949'),
       ('C6AA09D1-3BA2-4069-AFFB-1E9F98CDFF8D', '2EB8B0DB-EAF1-430A-BA69-39984D501EB9', 3, null, null, '2021-03-12 18:51:34.235464+00', '608955ae-52ed-44cc-884c-011597a77949');
