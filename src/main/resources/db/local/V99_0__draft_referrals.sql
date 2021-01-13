insert into referral (id, created_at, service_usercrn, completion_deadline, created_by_userid, created_by_user_auth_source, service_categoryid)
values ('ac386c25-52c8-41fa-9213-fcf42e24b0b5', '2020-12-07 18:02:01.599803+00', 'X987623', '2021-02-14', '2500128586', 'delius', null),
       ('dfb64747-f658-40e0-a827-87b4b0bdcfed', '2020-12-07 20:45:21.986389+00', 'X456234', '2021-03-01', '8751622134', 'delius', null),
       ('d496e4a7-7cc1-44ea-ba67-c295084f1962', '2020-12-24 09:32:32.871623+00', 'X542343', '2021-01-30', '2500128586', 'delius', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('1219a064-709b-4b6c-a11e-10b8cb3966f6', '2021-01-12 14:46:21.987234+00', 'X862134', null, '2500128586', 'delius', '428ee70f-3001-4399-95a6-ad25eaaede16');

insert into referral_service_user_data (referral_id, address, disabilities, dob, ethnicity, title, first_name, last_name, needs, nomis_number, other_names, pnc_number, preferred_language, religion_or_belief, sex, sexual_orientation)
values ('1219a064-709b-4b6c-a11e-10b8cb3966f6', 'Flat 2, 27 Test Walk, SY16 1AQ - Private rental', 'Autism spectrum condition', TO_DATE('1980-08-10', 'YYYY-MM-DD'), 'White British', 'Mr', 'Alex', 'River', null, '0203394', 'Shorty', '2014/1234786A', 'English', 'None', 'MALE', 'Heterosexual');
