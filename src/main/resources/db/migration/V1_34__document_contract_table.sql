COMMENT ON TABLE dynamic_framework_contract IS 'stores the scope of the commissioned rehabilitative services contracts';

COMMENT ON COLUMN dynamic_framework_contract.id IS 'service-owned unique identifier';
COMMENT ON COLUMN dynamic_framework_contract.service_provider_id IS 'awarded for a (prime) provider';
COMMENT ON COLUMN dynamic_framework_contract.start_date IS 'when delivery can start';
COMMENT ON COLUMN dynamic_framework_contract.end_date IS 'when delivery must end';
COMMENT ON COLUMN dynamic_framework_contract.service_category_id IS 'awarded for a service category';
COMMENT ON COLUMN dynamic_framework_contract.nps_region_id IS 'awarded to deliver in either an NPS or PCC region';
COMMENT ON COLUMN dynamic_framework_contract.pcc_region_id IS 'awarded to deliver in either an NPS or PCC region';
COMMENT ON COLUMN dynamic_framework_contract.allows_female IS 'whether female service users can attend';
COMMENT ON COLUMN dynamic_framework_contract.allows_male IS 'whether can male service users can attend';
COMMENT ON COLUMN dynamic_framework_contract.minimum_age IS 'the minimum age of attending service users';
COMMENT ON COLUMN dynamic_framework_contract.maximum_age IS 'the maximum age of attending service users';
