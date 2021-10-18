/*
    Same as v1_80, but used to target specific referrals that were not correctly migrated.
*/
with action_plans_ranked_by_approved_at_desc as (
    select id,
           referral_id,
           approved_at,
           row_number() over (partition by referral_id order by approved_at desc) rank
    from action_plan ap
    where approved_at is not null
    and referral_id in ('d7c7d7c1-df71-4501-9a0c-6649bcf31674', '4a95bf60-f5ab-4470-8988-addd705f0d5c')
)
update action_plan_session aps
set latest_approved = case when apr.rank = 1 then true else false end
from action_plans_ranked_by_approved_at_desc apr
where aps.deprecated_action_plan_id = apr.id;


