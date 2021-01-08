alter table referral
    add column created_by_user_auth_source varchar(255) not null;

update referral
        set created_by_userid = 'unknown',
        created_by_user_auth_source = 'unknown'
    where created_by_userid = null;

alter table referral
    alter column created_by_userid set not null;
