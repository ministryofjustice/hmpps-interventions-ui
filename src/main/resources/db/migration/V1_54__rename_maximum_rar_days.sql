alter table referral
    rename column maximum_rar_days to maximum_enforceable_days;

alter table referral
    drop column using_rar_days;