delete from referral_assignments where assigned_at is null;

alter table referral_assignments
    alter column assigned_at set not null;

alter table referral_assignments
    alter column assigned_by_id set not null;

alter table referral_assignments
    alter column assigned_to_id set not null;