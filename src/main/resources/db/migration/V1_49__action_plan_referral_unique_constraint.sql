drop index idx_action_plan_referral_id;
create unique index idx_action_plan_referral_id on action_plan (referral_id);