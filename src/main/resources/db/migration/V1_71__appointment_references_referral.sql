alter table appointment
    add column referral_id UUID,
    add constraint fk__appointment__referral foreign key (referral_id) references referral;
