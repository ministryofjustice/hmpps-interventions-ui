insert into pcc_region (id, name, nps_region_id) values
    ('metropolitan', 'London (Metropolitan Police)', 'J');

update dynamic_framework_contract
    set pcc_region_id = 'metropolitan'
    where pcc_region_id = 'city-of-london';

delete from pcc_region
    where id = 'city-of-london';
