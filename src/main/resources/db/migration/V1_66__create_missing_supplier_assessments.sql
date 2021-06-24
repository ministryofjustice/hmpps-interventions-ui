create extension if not exists pgcrypto;

insert into supplier_assessment (id, referral_id)
    select gen_random_uuid(), r.id
    from referral r
        left join supplier_assessment sa on sa.referral_id = r.id
        where sa.referral_id is null and r.sent_at is not null;