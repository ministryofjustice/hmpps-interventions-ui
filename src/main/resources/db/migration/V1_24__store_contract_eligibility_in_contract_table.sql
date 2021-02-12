alter table dynamic_framework_contract
    add column allows_female boolean not null default true,
    add column allows_male boolean not null default true,
    add column minimum_age int not null default 18,
    add column maximum_age int;

drop table contract_eligibility;
