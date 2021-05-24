insert into referral (id, intervention_id, created_at, sent_at, sent_by_id, service_usercrn, completion_deadline, created_by_id, further_information, additional_needs_information, accessibility_needs, needs_interpreter, interpreter_language, has_additional_responsibilities, when_unavailable, additional_risk_information, using_rar_days, maximum_rar_days, reference_number)
values ('ac386c25-52c8-41fa-9213-fcf42e24b0b5', '98a42c61-c30f-4beb-8062-04033c376e2d', '2020-12-07 18:02:01.599803+00', null, null, 'CRN16', '2021-02-14', '2500099998', null, null, null, null, null, null, null, null, null, null, null),
       ('dfb64747-f658-40e0-a827-87b4b0bdcfed', '98a42c61-c30f-4beb-8062-04033c376e2d', '2020-12-07 20:45:21.986389+00', null, null, 'CRN17', '2021-03-01', '11', null, null, null, null, null, null, null, null, null, null, null),
       ('745011c1-1ae5-45e4-99cb-6e1f2f8ccab9', '98a42c61-c30f-4beb-8062-04033c376e2d', '2020-12-07 20:45:21.986389+00', null, null, 'CRN18', null, '2500099998', null, null, null, null, null, null, null, null, null, null, null),
       ('d496e4a7-7cc1-44ea-ba67-c295084f1962', '98a42c61-c30f-4beb-8062-04033c376e2d', '2020-12-24 09:32:32.871623+00', null, null, 'CRN19', '2021-01-30', '2500099998', null, null, null, null, null, null, null, null, null, null, null),
       ('1219a064-709b-4b6c-a11e-10b8cb3966f6', '98a42c61-c30f-4beb-8062-04033c376e2d', '2021-01-12 14:46:21.987234+00', null, null, 'CRN20', null, '2500099998', null, null, null, null, null, null, null, null, null, null, null),
       ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '98a42c61-c30f-4beb-8062-04033c376e2d', '2021-01-12 14:46:21.987234+00', null, null, 'CRN21', null, '2500099998', null, null, null, null, null, null, null, null, null, null, null),
       ('2a67075a-9c77-4103-9de0-63c4cfe3e8d6', '98a42c61-c30f-4beb-8062-04033c376e2d', '2021-01-12 14:46:21.987234+00', null, null, 'CRN22', '2021-04-01', '2500099998', 'Some information about the service user', 'Alex is currently sleeping on her aunt''s sofa', 'She uses a wheelchair', true, 'Spanish', true, 'She works Mondays 9am - midday', 'A danger to the elderly', true, 10, null);

insert into referral_selected_service_category(referral_id, service_category_id)
values ('ac386c25-52c8-41fa-9213-fcf42e24b0b5', '428ee70f-3001-4399-95a6-ad25eaaede16'),
        ('dfb64747-f658-40e0-a827-87b4b0bdcfed', '428ee70f-3001-4399-95a6-ad25eaaede16'),
        ('745011c1-1ae5-45e4-99cb-6e1f2f8ccab9', '428ee70f-3001-4399-95a6-ad25eaaede16'),
        ('d496e4a7-7cc1-44ea-ba67-c295084f1962', '428ee70f-3001-4399-95a6-ad25eaaede16'),
        ('1219a064-709b-4b6c-a11e-10b8cb3966f6', '428ee70f-3001-4399-95a6-ad25eaaede16'),
        ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '428ee70f-3001-4399-95a6-ad25eaaede16'),
        ('2a67075a-9c77-4103-9de0-63c4cfe3e8d6', '428ee70f-3001-4399-95a6-ad25eaaede16');

insert into referral_complexity_level_ids(referral_id, complexity_level_ids, complexity_level_ids_key)
values ('2a67075a-9c77-4103-9de0-63c4cfe3e8d6', 'd0db50b0-4a50-4fc7-a006-9c97530e38b2', '428ee70f-3001-4399-95a6-ad25eaaede16');

insert into referral_service_user_data (referral_id, disabilities, dob, ethnicity, title, first_name, last_name, preferred_language, religion_or_belief, gender)
values ('ac386c25-52c8-41fa-9213-fcf42e24b0b5', '{Autism spectrum condition}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Accepted', 'BEN', 'CASSIDY', 'English', 'None', 'Male'),
       ('dfb64747-f658-40e0-a827-87b4b0bdcfed', '{}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Ms', 'DULQRENIERRE', 'LENOLD', 'Gujarati', 'None', 'Female'),
       ('745011c1-1ae5-45e4-99cb-6e1f2f8ccab9', '{}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Ms', 'ULVAMOSE', 'JAYMENTINO', 'Welsh', 'None', 'Female'),
       ('d496e4a7-7cc1-44ea-ba67-c295084f1962', '{}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Mr', 'OGANONTHOMASIN', 'DEVIEVE', 'English', 'None', 'Male'),
       ('1219a064-709b-4b6c-a11e-10b8cb3966f6', '{}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Mr', 'YMYNNEUMAR', 'ZACHASINA', 'English', 'None', 'Male'),
       ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '{}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Ms', 'ILBNELIWA', 'ANOLPH', 'Spanish', 'None', 'Female'),
       ('2a67075a-9c77-4103-9de0-63c4cfe3e8d6', '{}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Mr', 'ADNKELNA', 'FATALIE', 'English', 'Jewish', 'Male');
