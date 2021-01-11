alter table referral
    alter column created_by_userid set not null,
    alter column created_by_user_auth_source set not null;
