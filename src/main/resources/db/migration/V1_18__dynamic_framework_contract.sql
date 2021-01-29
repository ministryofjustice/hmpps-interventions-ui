create table dynamic_framework_contract (
  id uuid not null,

  service_category_id uuid not null,
  service_provider_id varchar(30) not null,

  start_date date not null,
  end_date date not null,

  nps_region_id char,
  pcc_region_id text,

  primary key (id),
  constraint fk__dynamic_framework_contract__service_category_id foreign key (service_category_id) references service_category,
  constraint fk__dynamic_framework_contract__service_provider_id foreign key (service_provider_id) references service_provider,
  constraint fk__dynamic_framework_contract__pcc_region_id foreign key (pcc_region_id) references pcc_region,
  constraint fk__dynamic_framework_contract__nps_region_id foreign key (nps_region_id) references nps_region
);

create table contract_eligibility (
    dynamic_framework_contract_id uuid not null,
    minimum_age int not null,
    maximum_age int not null,
    allows_female boolean not null,
    allows_male boolean not null,

    primary key (dynamic_framework_contract_id),
    constraint fk__contract_eligibility__dynamic_framework_contract_id foreign key (dynamic_framework_contract_id) references dynamic_framework_contract
);

