create table auth_user(
  id text not null,
  auth_source text not null,
  primary key (id)
);

alter table referral
    add column sent_at timestamp with time zone,
    add column sent_by_id text,
    add constraint fk_sent_by_id foreign key (sent_by_id) references auth_user;
