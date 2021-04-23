alter table cancellation_reason
    rename column id TO code;

alter table referral drop constraint FK_cancellation_reason_id;
alter table referral rename column cancellation_reason_id to cancellation_reason_code;
alter table referral add column cancellation_comments text;

alter table referral add constraint FK_cancellation_reason_code foreign key (cancellation_reason_code) references cancellation_reason;