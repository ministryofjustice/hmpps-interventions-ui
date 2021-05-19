insert into contract_type(id, name, code)
Values  ('72e60faf-b8e5-4699-9d7c-aef631cca71b', 'Accomodation', 'ACC'),
        ('b402486d-991e-4977-9291-073a3526d60f', 'Education, Training and Employment', 'ETE'),
        ('bf68c1c6-f83b-45ed-a6f7-495456e5745a', 'Finance, Debt and Benefits', 'RDB'), --why R?
        ('e46e76e1-38da-46a4-afc0-d5e7283ebb03', 'Dependency and recovery', 'D&R'),
        ('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'Personal Wellbeing', 'PWB'),
        ('ab0ddafa-619a-47c1-89ca-3709b2833761', 'Lifestyle, associates and social inclusion', 'LSI');

insert into contract_type_service_category(contract_type_id, service_category_id)
Values ('72e60faf-b8e5-4699-9d7c-aef631cca71b', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('b402486d-991e-4977-9291-073a3526d60f', 'ca374ac3-84eb-4b91-bea7-9005398f426f'),
       ('bf68c1c6-f83b-45ed-a6f7-495456e5745a', '96a63c39-4371-4f17-a6ec-265755f0cf7b'),
       ('e46e76e1-38da-46a4-afc0-d5e7283ebb03', '76bcdb97-1dea-41c1-a4f8-899d88e5d679'),

       ('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'b84f4eb7-4db0-477e-8c59-21027b3262c5'),
       ('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', '9556a399-3529-4993-8030-41db2090555e'),
       ('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', '8221a81c-08b2-4262-9c1a-0ab3c82cec8c'),
       ('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'c036826e-f077-49a5-8b33-601dca7ad479');
