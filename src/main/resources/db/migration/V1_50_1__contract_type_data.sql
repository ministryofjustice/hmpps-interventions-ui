insert into contract_type(id, name, code)
Values  ('72e60faf-b8e5-4699-9d7c-aef631cca71b', 'Accommodation', 'ACC'),
        ('b402486d-991e-4977-9291-073a3526d60f', 'Education, Training and Employment (ETE)', 'ETE'),
        ('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'Personal Wellbeing', 'PWB'),
        ('b74c3f1d-2c53-45c0-bd23-d61befaf00af', 'Women''s Services', 'WOS');

insert into contract_type_service_category(contract_type_id, service_category_id)
Values ('72e60faf-b8e5-4699-9d7c-aef631cca71b', '428ee70f-3001-4399-95a6-ad25eaaede16'),
       ('b402486d-991e-4977-9291-073a3526d60f', 'ca374ac3-84eb-4b91-bea7-9005398f426f'),

-- PWB
('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'b84f4eb7-4db0-477e-8c59-21027b3262c5'),
('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', '9556a399-3529-4993-8030-41db2090555e'),
('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', '8221a81c-08b2-4262-9c1a-0ab3c82cec8c'),
('f9b59d2c-c60b-4eb0-8469-04c975d2e2ee', 'c036826e-f077-49a5-8b33-601dca7ad479'),

-- WOS
('b74c3f1d-2c53-45c0-bd23-d61befaf00af', '428ee70f-3001-4399-95a6-ad25eaaede16'),
('b74c3f1d-2c53-45c0-bd23-d61befaf00af', 'ca374ac3-84eb-4b91-bea7-9005398f426f'),
('b74c3f1d-2c53-45c0-bd23-d61befaf00af', '96a63c39-4371-4f17-a6ec-265755f0cf7b'),
('b74c3f1d-2c53-45c0-bd23-d61befaf00af', '76bcdb97-1dea-41c1-a4f8-899d88e5d679'),
('b74c3f1d-2c53-45c0-bd23-d61befaf00af', 'b84f4eb7-4db0-477e-8c59-21027b3262c5'),
('b74c3f1d-2c53-45c0-bd23-d61befaf00af', '9556a399-3529-4993-8030-41db2090555e'),
('b74c3f1d-2c53-45c0-bd23-d61befaf00af', '8221a81c-08b2-4262-9c1a-0ab3c82cec8c'),
('b74c3f1d-2c53-45c0-bd23-d61befaf00af', 'c036826e-f077-49a5-8b33-601dca7ad479');
