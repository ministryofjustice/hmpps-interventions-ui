ALTER TABLE metadata
    ADD COLUMN domain_data boolean;

UPDATE metadata
SET domain_data = FALSE
WHERE table_name = 'flyway_schema_history'
   OR table_name LIKE 'batch_%';

UPDATE metadata
SET domain_data = TRUE
WHERE domain_data IS NULL;

ALTER TABLE metadata
    ALTER COLUMN domain_data SET NOT NULL;

INSERT INTO metadata (table_name, column_name, sensitive, domain_data)
VALUES ('metadata', 'domain_data', FALSE, TRUE);
