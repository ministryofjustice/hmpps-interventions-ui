ALTER TABLE dynamic_framework_contract ADD COLUMN contract_reference varchar(30);

UPDATE dynamic_framework_contract
    SET contract_reference = substr(md5(random()::text), 0, 25) WHERE contract_reference IS NULL;

ALTER TABLE dynamic_framework_contract ALTER COLUMN contract_reference SET NOT NULL;
ALTER TABLE dynamic_framework_contract ADD UNIQUE (contract_reference);
