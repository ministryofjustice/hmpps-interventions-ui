alter table dynamic_framework_contract
    rename column service_provider_id to prime_provider_id;

create table dynamic_framework_contract_sub_contractor(
      dynamic_framework_contract_id uuid not null,
      sub_contractor_id varchar(255) not null,
      constraint pk_subcontractor primary key (sub_contractor_id, dynamic_framework_contract_id),
      constraint fk_subcontractor_id foreign key (sub_contractor_id) references service_provider,
      constraint fk_contract_id foreign key (dynamic_framework_contract_id) references dynamic_framework_contract
);
