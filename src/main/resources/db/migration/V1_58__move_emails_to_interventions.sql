alter table intervention
    add column incoming_referral_distribution_email text not null default '__no_data__';

update intervention i
set incoming_referral_distribution_email = p.incoming_referral_distribution_email
from service_provider p join dynamic_framework_contract c on p.id = c.prime_provider_id
where i.dynamic_framework_contract_id = c.id;

alter table service_provider
    drop column incoming_referral_distribution_email;
