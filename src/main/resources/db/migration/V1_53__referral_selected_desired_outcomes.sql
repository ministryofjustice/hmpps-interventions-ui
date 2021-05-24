begin;
alter table referral_desired_outcome
    add column service_category_id uuid,
    add constraint fk_referral_desired_outcome_service_category_id foreign key (referral_id, service_category_id) references referral_selected_service_category,
    drop constraint referral_desired_outcome_referral_id_desired_outcome_id_key,
    add unique(referral_id, service_category_id, desired_outcome_id);

update referral_desired_outcome
    set service_category_id = (
        select desired_outcome.service_category_id from desired_outcome where referral_desired_outcome.desired_outcome_id = desired_outcome.id
    );

alter table referral_desired_outcome alter column service_category_id set not null;
commit;