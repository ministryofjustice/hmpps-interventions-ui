insert into dynamic_framework_contract (id, service_category_id, service_provider_id, start_date, end_date, nps_region_id)
values ('1d7f8fcc-aa12-4705-a6a5-0d40467e03e9', '428ee70f-3001-4399-95a6-ad25eaaede16', 'HARMONY_LIVING',
        TO_DATE('2020-12-15', 'YYYY-MM-DD'), TO_DATE('2023-12-15', 'YYYY-MM-DD'), 'G');

insert into contract_eligibility (dynamic_framework_contract_id, allows_female, allows_male, minimum_age, maximum_age)
values ('1d7f8fcc-aa12-4705-a6a5-0d40467e03e9', true, true, 18, 25);

insert into intervention (id, dynamic_framework_contract_id, created_at, title, description)
values ('98a42c61-c30f-4beb-8062-04033c376e2d', '1d7f8fcc-aa12-4705-a6a5-0d40467e03e9', TO_DATE('2020-10-15', 'YYYY-MM-DD'), 'Accommodation Service', 'Help find sheltered housing');

