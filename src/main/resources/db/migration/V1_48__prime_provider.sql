alter table dynamic_framework_contract
    rename column service_provider_id to prime_provider_id;

create table dynamic_framework_contract_sub_contractor(
      dynamic_framework_contract_id uuid not null,
      subcontractor_provider_id varchar(30) not null,
      constraint pk_subcontractor primary key (subcontractor_provider_id, dynamic_framework_contract_id),
      constraint fk_subcontractor_id foreign key (subcontractor_provider_id) references service_provider,
      constraint fk_contract_id foreign key (dynamic_framework_contract_id) references dynamic_framework_contract
);
