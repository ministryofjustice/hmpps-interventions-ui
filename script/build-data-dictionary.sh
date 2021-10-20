#!/bin/sh -e
basedir=$(dirname "$0")
jardir="$basedir/libs"
schemadir="$basedir/schema"

mkdir -p "$jardir" "$schemadir"

wget https://github.com/schemaspy/schemaspy/releases/download/v6.1.0/schemaspy-6.1.0.jar -O "$jardir/schemaspy.jar"
wget https://jdbc.postgresql.org/download/postgresql-42.2.19.jar -O "$jardir/postgresql.jar"

java -jar "$jardir/schemaspy.jar" -t pgsql -dp "$jardir/postgresql.jar" \
  -db "${POSTGRES_DB:-interventions}" -host "localhost" -port "5432" -u "postgres" -p "password" \
  -nopages \
  -o "$schemadir"
