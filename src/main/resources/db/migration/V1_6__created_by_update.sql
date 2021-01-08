alter table referral
    add column created_by_user_auth_source varchar(255) not null;

-- all the referrals that currently exist are in dev, so updating to a known dev user_id
update referral
    set created_by_userid = '2500128586',
        created_by_user_auth_source = 'delius'
    where created_by_userid = null;

alter table referral
    alter column created_by_userid set not null;
