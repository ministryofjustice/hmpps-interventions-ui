create table service_category(
  id uuid NOT NULL,
  created timestamp with time zone,
  name text not null,

  primary key (id)
);
