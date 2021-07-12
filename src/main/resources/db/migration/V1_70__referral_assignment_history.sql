create table referral_assignments
(
    referral_id    uuid not null,
    assigned_at    timestamp with time zone,
    assigned_by_id text,
    assigned_to_id text,
    constraint fk_referral_id foreign key (referral_id) references referral,
    constraint fk_assigned_by_id_auth_user foreign key (assigned_by_id) references auth_user,
    constraint fk_assigned_to_id_auth_user foreign key (assigned_to_id) references auth_user
);

create index on referral_assignments (referral_id);

insert into referral_assignments
select id, assigned_at, assigned_by_id, assigned_to_id
from referral;

alter table referral
    rename column assigned_at to deprecated_assigned_at;
alter table referral
    rename column assigned_by_id to deprecated_assigned_by_id;
alter table referral
    rename column assigned_to_id to deprecated_assigned_to_id;
