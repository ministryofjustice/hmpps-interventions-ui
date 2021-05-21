
create table referral_selected_service_category(
    referral_id uuid not null,
    service_category_id uuid not null,
    constraint pk_referral_selected_service_category primary key (referral_id, service_category_id),
    constraint fk_service_category_id foreign key (service_category_id) references service_category,
    constraint fk_referral_id foreign key (referral_id) references referral
);


-- If there are any existing referrals then assume that the selected service categories are all of the ones present in the contract
insert into referral_selected_service_category
    select referral.id, service_category.id from referral, intervention, dynamic_framework_contract, contract_type, contract_type_service_category, service_category
    where referral.intervention_id = intervention.id
    and intervention.dynamic_framework_contract_id = dynamic_framework_contract.id
    and dynamic_framework_contract.contract_type_id = contract_type.id
    and contract_type.id = contract_type_service_category.contract_type_id
    and contract_type_service_category.service_category_id = service_category.id
