insert into referral (id, intervention_id, created_at, sent_at, sent_by_id, service_usercrn, completion_deadline, created_by_id, further_information, additional_needs_information, accessibility_needs, needs_interpreter, interpreter_language, has_additional_responsibilities, when_unavailable, additional_risk_information, using_rar_days, maximum_rar_days, complexity_levelid, reference_number)
values ('ac386c25-52c8-41fa-9213-fcf42e24b0b5', '98a42c61-c30f-4beb-8062-04033c376e2d', '2020-12-07 18:02:01.599803+00', null, null, 'X987623', '2021-02-14', '2500128586', null, null, null, null, null, null, null, null, null, null, null, null),
       ('dfb64747-f658-40e0-a827-87b4b0bdcfed', '98a42c61-c30f-4beb-8062-04033c376e2d', '2020-12-07 20:45:21.986389+00', null, null, 'X456234', '2021-03-01', '8751622134', null, null, null, null, null, null, null, null, null, null, null, null),
       ('745011c1-1ae5-45e4-99cb-6e1f2f8ccab9', '98a42c61-c30f-4beb-8062-04033c376e2d', '2020-12-07 20:45:21.986389+00', null, null, 'X234876', null, '2500128586', null, null, null, null, null, null, null, null, null, null, null, null),
       ('d496e4a7-7cc1-44ea-ba67-c295084f1962', '98a42c61-c30f-4beb-8062-04033c376e2d', '2020-12-24 09:32:32.871623+00', null, null, 'X542343', '2021-01-30', '2500128586', null, null, null, null, null, null, null, null, null, null, null, null),
       ('1219a064-709b-4b6c-a11e-10b8cb3966f6', '98a42c61-c30f-4beb-8062-04033c376e2d', '2021-01-12 14:46:21.987234+00', null, null, 'X862134', null, '2500128586', null, null, null, null, null, null, null, null, null, null, null, null),
       ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '98a42c61-c30f-4beb-8062-04033c376e2d', '2021-01-12 14:46:21.987234+00', null, null, 'X872391', null, '2500128586', null, null, null, null, null, null, null, null, null, null, null, null),
       ('2a67075a-9c77-4103-9de0-63c4cfe3e8d6', '98a42c61-c30f-4beb-8062-04033c376e2d', '2021-01-12 14:46:21.987234+00', null, null, 'X862134', '2021-04-01', '2500128586', 'Some information about the service user', 'Alex is currently sleeping on her aunt''s sofa', 'She uses a wheelchair', true, 'Spanish', true, 'She works Mondays 9am - midday', 'A danger to the elderly', true, 10, 'd0db50b0-4a50-4fc7-a006-9c97530e38b2', null),
       ('81d754aa-d868-4347-9c0f-50690773014e', '98a42c61-c30f-4beb-8062-04033c376e2d', '2021-01-11 10:32:12.382884+00', '2021-01-14 15:56:45.382884+00', '2500128586', 'CRN23', '2021-04-01', '2500128586', 'Some information about the service user', 'Alex is currently sleeping on her aunt''s sofa', 'She uses a wheelchair', true, 'Spanish', true, 'She works Mondays 9am - midday', 'A danger to the elderly', true, 10, 'd0db50b0-4a50-4fc7-a006-9c97530e38b2', 'HDJ2123F');

insert into referral_service_user_data (referral_id, disabilities, dob, ethnicity, title, first_name, last_name, preferred_language, religion_or_belief, gender)

values ('1219a064-709b-4b6c-a11e-10b8cb3966f6', '{Autism spectrum condition}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Mr', 'Alex', 'River', 'English', 'None', 'Male'),
       ('2a67075a-9c77-4103-9de0-63c4cfe3e8d6', null, null, null, null, 'Alex', null, null, null, null),
       ('81d754aa-d868-4347-9c0f-50690773014e', '{Autism spectrum condition, sciatica}', TO_DATE('1980-01-01', 'YYYY-MM-DD'), 'British', 'Mr', 'Alex', 'River', 'English', 'Agnostic', 'Male');

insert into referral_desired_outcome (referral_id, desired_outcome_id)
values ('81d754aa-d868-4347-9c0f-50690773014e', '301ead30-30a4-4c7c-8296-2768abfb59b5'),
       ('81d754aa-d868-4347-9c0f-50690773014e', '65924ac6-9724-455b-ad30-906936291421');
--        ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '301ead30-30a4-4c7c-8296-2768abfb59b5'),
--        ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '65924ac6-9724-455b-ad30-906936291421'),
--        ('d496e4a7-7cc1-44ea-ba67-c295084f1962', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'),
--        ('d496e4a7-7cc1-44ea-ba67-c295084f1962', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d');
