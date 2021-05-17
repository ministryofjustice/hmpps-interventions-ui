insert into service_provider(id, name, incoming_referral_distribution_email)
values ('HARMONY_LIVING', 'Harmony Living', 'contact@harmonyliving.com'),
       ('HOME_TRUST', 'Home Trust', 'contact@hometrust.com'),
       ('HELPING_HANDS', 'Helping Hands', 'contact@helpinghands.com');

insert into dynamic_framework_contract (id, contract_type_id, prime_provider_id, start_date, end_date, nps_region_id, pcc_region_id, allows_female, allows_male, minimum_age, maximum_age, contract_reference)
values ('1d7f8fcc-aa12-4705-a6a5-0d40467e03e9', '72e60faf-b8e5-4699-9d7c-aef631cca71b', 'HARMONY_LIVING', TO_DATE('2020-12-15', 'YYYY-MM-DD'), TO_DATE('2023-12-15', 'YYYY-MM-DD'), 'G', null, true, true, 18, 25, '0001'),
       ('f9d24b4a-390d-4cc1-a7ee-3e6f022e1599', '72e60faf-b8e5-4699-9d7c-aef631cca71b', 'HARMONY_LIVING', TO_DATE('2020-01-01', 'YYYY-MM-DD'), TO_DATE('2022-12-31', 'YYYY-MM-DD'), 'G', null, true, false, 18, 25, '0002'),
       ('24f7a423-15a6-438d-9d28-063e92b25a9b', '72e60faf-b8e5-4699-9d7c-aef631cca71b', 'HARMONY_LIVING', TO_DATE('2021-12-11', 'YYYY-MM-DD'), TO_DATE('2025-12-11', 'YYYY-MM-DD'), null, 'avon-and-somerset', true, true, 25, null, '0003'),
       ('c7d39f92-6f43-49a4-bb62-e0f42c864765', 'f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'HOME_TRUST', TO_DATE('2021-01-01', 'YYYY-MM-DD'), TO_DATE('2035-05-01', 'YYYY-MM-DD'), 'G', null, false, true, 18, null, '0004'),
       ('0b60d842-9c08-408e-8c8d-f6dbf8e5c3f4', 'f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'HOME_TRUST', TO_DATE('2021-01-01', 'YYYY-MM-DD'), TO_DATE('2035-05-01', 'YYYY-MM-DD'), 'J', null, true, true, 18, null, '0005'),
       ('56ad7d77-94c7-4fbf-a704-29e0f6ad078f', 'f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'HOME_TRUST', TO_DATE('2021-01-01', 'YYYY-MM-DD'), TO_DATE('2035-05-01', 'YYYY-MM-DD'), 'A', null, true, true, 18, null, '0006');

insert into intervention (id, dynamic_framework_contract_id, created_at, title, description)
values ('98a42c61-c30f-4beb-8062-04033c376e2d', '1d7f8fcc-aa12-4705-a6a5-0d40467e03e9', TO_DATE('2020-10-15', 'YYYY-MM-DD'), 'Accommodation Service', 'The service aims are to support in securing settled accommodation.'),
       ('90e35306-5d65-4901-bb36-c4c44c7d19f9', 'f9d24b4a-390d-4cc1-a7ee-3e6f022e1599', TO_DATE('2021-01-15', 'YYYY-MM-DD'), 'Sheltered Accommodation', 'Providing help to move female service users into safe accommodation.'),
       ('08524319-7d5b-4b56-862a-bfe2c9a545f5', '24f7a423-15a6-438d-9d28-063e92b25a9b', TO_DATE('2021-02-01', 'YYYY-MM-DD'), 'Accommodation/Good Tenant', 'This course offers practical information and advice helping participants understand what it means to be a ''good'' tenant.'),
       ('f803445f-326c-4ef8-aee2-f7716d417832', 'c7d39f92-6f43-49a4-bb62-e0f42c864765', TO_DATE('2020-11-11', 'YYYY-MM-DD'), 'Social Inclusion', 'This programme is aimed at males who have offended.

• This programme is aimed at males who have offended.
• This is some more text about the intervention'),
       ('15237ae5-a017-4de6-a033-abf350f14d99', '0b60d842-9c08-408e-8c8d-f6dbf8e5c3f4', TO_DATE('2020-11-11', 'YYYY-MM-DD'), 'Begins at Home', 'This service is dedicated for handling challenging situations at home.'),
       ('3ccb511b-89b2-42f7-803b-304f54d85a24', '1435d1c5-0c22-459a-bd1a-ce593fba6c05', TO_DATE('2020-11-11', 'YYYY-MM-DD'), 'Kick your Habit', 'Drug and alcohol rehab.');

insert into dynamic_framework_contract_sub_contractor(dynamic_framework_contract_id, subcontractor_provider_id)
values('1d7f8fcc-aa12-4705-a6a5-0d40467e03e9', 'HOME_TRUST'),
      ('1d7f8fcc-aa12-4705-a6a5-0d40467e03e9', 'HELPING_HANDS'),
      ('1435d1c5-0c22-459a-bd1a-ce593fba6c05', 'HARMONY_LIVING');
