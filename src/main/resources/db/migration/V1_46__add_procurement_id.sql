ALTER TABLE dynamic_framework_contract ADD COLUMN contract_reference varchar(30);

UPDATE dynamic_framework_contract
    SET contract_reference = substr(md5(random()::text), 0, 25) WHERE contract_reference IS NULL;

ALTER TABLE dynamic_framework_contract ADD CONSTRAINT contract_reference_not_null CHECK (contract_reference IS NOT NULL);
ALTER TABLE dynamic_framework_contract ADD CONSTRAINT contract_reference_unique UNIQUE (contract_reference);