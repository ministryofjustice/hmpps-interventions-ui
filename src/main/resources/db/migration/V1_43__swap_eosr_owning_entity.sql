alter table end_of_service_report
    add column referral_id uuid,
    add constraint fk_referral_id foreign key (referral_id) references referral;

update end_of_service_report
    set referral_id = referral.id
    from referral where end_of_service_report.id = referral.end_of_service_report_id;

alter table end_of_service_report
    alter column referral_id set not null;

alter table referral
    drop column end_of_service_report_id;