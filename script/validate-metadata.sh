#!/bin/bash
missing_columns="SELECT m.*
FROM information_schema.columns i
         LEFT JOIN metadata m ON i.table_name = m.table_name AND i.column_name = m.column_name
WHERE i.table_schema = 'public'
  AND (m.sensitive IS NULL OR m.domain_data IS NULL);"

missing_table_comment="SELECT c.table_name, pg_catalog.obj_description(c.table_name::regclass::oid) AS table_comment
FROM information_schema.columns AS c
         JOIN metadata AS m ON (c.table_name = m.table_name AND c.column_name = m.column_name)
WHERE c.table_schema = 'public'
  AND m.domain_data = TRUE
  AND pg_catalog.obj_description(c.table_name::regclass::oid) IS NULL
GROUP BY c.table_name
ORDER BY c.table_name;"

found_missing_doc=""

column_validation="$(psql -v"ON_ERROR_STOP=1" -U"postgres" "postgresql://localhost:5432/${POSTGRES_DB:-interventions}" \
  --command "$missing_columns")"

echo
echo "Unclassified columns:"
echo "$column_validation"
echo

if [[ "$column_validation" =~ \(0\ rows\) ]]; then
  echo "✅ All columns are classified in the metadata table"
else
  found_missing_doc="x"
  echo "😰 Unclassified columns found"
  echo
  echo "Fix by adding this into your new migration:"
  echo "INSERT INTO metadata (table_name, column_name, ...) VALUES (..., ..., ...);"
fi

table_comment_validation="$(psql -v"ON_ERROR_STOP=1" -U"postgres" "postgresql://localhost:5432/${POSTGRES_DB:-interventions}" \
  --command "$missing_table_comment")"

echo
echo "Undocumented domain tables:"
echo "$table_comment_validation"
echo

if [[ "$table_comment_validation" =~ \(0\ rows\) ]]; then
  echo "✅ All domain tables are documented in the R__data_dictionary.sql migration"
else
  found_missing_doc="x"
  echo "😰 Undocumented domain tables found"
  echo
  echo "Fix by adding this into R__data_dictionary.sql:"
  echo "COMMENT ON TABLE table_name IS '...useful information for data users...';"
fi

if [[ "x" == "$found_missing_doc" ]]; then
  exit 1
fi
