alter table referral
    add column intervention_id uuid not null default '00000000-0000-0000-0000-000000000000',
    drop column service_categoryid,
    add constraint fk_intervention_id foreign key (intervention_id) references intervention;

