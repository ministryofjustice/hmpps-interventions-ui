create table complexity_level(
    id uuid not null,
    title text not null,
    description text not null,
    service_category_id uuid not null,
    primary key (id)
);

alter table complexity_level
    add constraint FK_service_category_id foreign key (service_category_id) references service_category;
