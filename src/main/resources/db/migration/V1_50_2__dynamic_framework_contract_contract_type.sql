alter table dynamic_framework_contract
    add column contract_type_id uuid,
    add constraint fk__contract_type__contract_type_id foreign key(contract_type_id) references contract_type;

update dynamic_framework_contract
set contract_type_id = subquery.contract_type_id
from (select id, t.contract_type_id
      from dynamic_framework_contract c
               inner join contract_type_service_category t
                          on t.service_category_id = c.service_category_id) as subquery
where dynamic_framework_contract.id = subquery.id;

alter table dynamic_framework_contract
    drop column service_category_id,
    alter column contract_type_id set not null;