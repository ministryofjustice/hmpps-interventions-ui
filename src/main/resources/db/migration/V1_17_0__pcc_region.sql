create table pcc_region (
    id text not null,
    name text unique not null,
    nps_region_id char not null,

    primary key (id),
    constraint fk__pcc_region__nps_region_id foreign key (nps_region_id) references nps_region
);
