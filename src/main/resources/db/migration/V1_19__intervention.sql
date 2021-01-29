create table intervention (
    id uuid not null,
    dynamic_framework_contract_id uuid not null,
    created_at timestamp with time zone not null,
    title text not null,
    description text not null,

    primary key (id),
    constraint fk__intervention__dynamic_framework_contract_id foreign key (dynamic_framework_contract_id) references dynamic_framework_contract
);
