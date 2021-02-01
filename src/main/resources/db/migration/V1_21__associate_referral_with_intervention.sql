alter table referral
    add column intervention_id uuid,
    add constraint fk_intervention_id foreign key (intervention_id) references intervention;
