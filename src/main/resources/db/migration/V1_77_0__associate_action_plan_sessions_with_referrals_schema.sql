alter table action_plan_session
    add column referral_id uuid,
    add constraint fk_referral_id foreign key (referral_id) references referral;
