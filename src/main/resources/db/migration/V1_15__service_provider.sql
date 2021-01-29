create table service_provider (
  id varchar(30) not null,
  name text not null,
  incoming_referral_distribution_email text not null,

  primary key (id)
);
