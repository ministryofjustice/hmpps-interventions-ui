#!/bin/sh -e
for sqlfile in helm_deploy/hmpps-interventions-service/reports/*.sql; do
  echo
  echo "🧪 Validating $sqlfile"
  PSQL_PAGER="" psql -v ON_ERROR_STOP=1 -U"postgres" "postgresql://localhost:5432/${POSTGRES_DB:-interventions}" -f "$sqlfile"
done
