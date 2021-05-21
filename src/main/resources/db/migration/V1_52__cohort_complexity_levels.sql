create table referral_complexity_level_ids (
    referral_id uuid not null,
    complexity_level_ids uuid,
    complexity_level_ids_key uuid not null,
    constraint fk_referral_complexity_level_ids_referral_id foreign key (referral_id) references referral,
    constraint fk_referral_complexity_level_ids_complexity_level_ids_key foreign key (referral_id, complexity_level_ids_key) references referral_selected_service_category,
    primary key (referral_id, complexity_level_ids_key)
);
