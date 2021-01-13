create table desired_outcome(
  id uuid not null,
  description text not null,
  service_category_id uuid not null,

  primary key (id),
  constraint fk__desired_outcome__service_category foreign key(service_category_id) references service_category
);

create table referral_desired_outcome(
    referral_id        uuid not null,
    desired_outcome_id uuid not null,

    unique(referral_id , desired_outcome_id),
    constraint fk__referral_desired_outcome__referral foreign key (referral_id) references referral,
    constraint fk__referral_desired_outcome__desired_outcome foreign key (desired_outcome_id) references desired_outcome
);

create index IX_referral_desired_outcome__referral_id ON referral_desired_outcome (referral_id);
