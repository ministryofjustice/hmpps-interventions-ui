#!/bin/bash -e
missing_columns="SELECT i.table_name, i.column_name
FROM information_schema.columns i
         LEFT JOIN metadata m ON i.table_name = m.table_name AND i.column_name = m.column_name
WHERE i.table_schema = 'public'
  AND m.sensitive IS NULL;"

validation="$(psql -v"ON_ERROR_STOP=1" -U"postgres" "postgresql://localhost:5432/${POSTGRES_DB:-interventions}" \
  --command "$missing_columns")"

echo "Undocumented columns:"
echo "$validation"
echo

if [[ "$validation" =~ \(0\ rows\) ]]; then
  echo "✅ All columns are documented in the metadata table"
else
  echo "😰 Undocumented columns found"
  echo
  echo "Fix by adding this into your new migration:"
  echo "INSERT INTO metadata (table_name, column_name, ...) VALUES (..., ..., ...);"
  exit 1
fi
