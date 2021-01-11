alter table referral
    add column created_by_user_auth_source varchar(255);

update referral
    set created_by_userid = 'unknown'
    where created_by_userid IS NULL;

update referral
    set created_by_user_auth_source = 'unknown'
    where created_by_user_auth_source IS NULL;
