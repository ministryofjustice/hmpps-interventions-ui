alter table referral
    add column created_by_userid varchar(255);

create index IX_referral_created_by_userid on referral (created_by_userid);
