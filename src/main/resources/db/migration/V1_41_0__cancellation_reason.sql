create table cancellation_reason (
    id varchar(3) not null,
    description text not null,

    primary key (id)
);

alter table referral
    add column cancellation_reason_id varchar(3),
    add constraint FK_cancellation_reason_id foreign key (cancellation_reason_id) references cancellation_reason;

