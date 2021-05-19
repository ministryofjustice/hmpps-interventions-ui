create table contract_type(
  id uuid not null,
  name text not null,
  code varchar(10) not null,
  primary key (id)
);

alter table dynamic_framework_contract
    drop column service_category_id,
    add column contract_type_id uuid default '72e60faf-b8e5-4699-9d7c-aef631cca71b',
    add constraint fk__contract_type__contract_type_id foreign key(contract_type_id) references contract_type;

create table contract_type_service_category(
                  contract_type_id uuid not null,
                  service_category_id uuid not null,
                  constraint pk_contract_type_service_category primary key (contract_type_id, service_category_id),
                  constraint fk_contract_type foreign key (contract_type_id) references contract_type,
                  constraint fk_service_category_id foreign key (service_category_id) references service_category
);
