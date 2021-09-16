UPDATE action_plan_session aps
SET referral_id = ap.referral_id
FROM action_plan ap
WHERE aps.action_plan_id = ap.id
AND aps.referral_id is null;

alter table action_plan_session
    alter column referral_id set not null;
