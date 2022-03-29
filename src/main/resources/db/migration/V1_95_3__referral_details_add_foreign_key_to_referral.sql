alter table referral_details
    add constraint fk_referral_details_referral_id foreign key (referral_id) references referral;