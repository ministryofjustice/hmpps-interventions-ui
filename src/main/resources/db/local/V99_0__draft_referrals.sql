insert into auth_user (id, auth_source)
values ('2500128586', 'delius'),
       ('8751622134', 'delius');

insert into referral (id, created_at, service_usercrn, completion_deadline, created_by_id, service_categoryid)
values ('ac386c25-52c8-41fa-9213-fcf42e24b0b5', '2020-12-07 18:02:01.599803+00', 'X987623', '2021-02-14', '2500128586', null),
       ('dfb64747-f658-40e0-a827-87b4b0bdcfed', '2020-12-07 20:45:21.986389+00', 'X456234', '2021-03-01', '8751622134', null),
       ('d496e4a7-7cc1-44ea-ba67-c295084f1962', '2020-12-24 09:32:32.871623+00', 'X542343', '2021-01-30', '2500128586', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('1219a064-709b-4b6c-a11e-10b8cb3966f6', '2021-01-12 14:46:21.987234+00', 'X862134', null, '2500128586', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '2021-01-12 14:46:21.987234+00', 'X872391', null, '2500128586', '428ee70f-3001-4399-95a6-ad25eaaede16');

insert into referral_service_user_data (referral_id, disabilities, dob, ethnicity, title, first_name, last_name, preferred_language, religion_or_belief, gender)
values ('1219a064-709b-4b6c-a11e-10b8cb3966f6', '{Autism spectrum condition}', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Mr', 'Alex', 'River', 'English', 'None', 'Male');

insert into referral_desired_outcome (referral_id, desired_outcome_id)
values ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '301ead30-30a4-4c7c-8296-2768abfb59b5'),
       ('037cc90b-beaa-4a32-9ab7-7f79136e1d27', '65924ac6-9724-455b-ad30-906936291421'),
       ('d496e4a7-7cc1-44ea-ba67-c295084f1962', '9b30ffad-dfcb-44ce-bdca-0ea49239a21a'),
       ('d496e4a7-7cc1-44ea-ba67-c295084f1962', 'e7f199de-eee1-4f57-a8c9-69281ea6cd4d');
