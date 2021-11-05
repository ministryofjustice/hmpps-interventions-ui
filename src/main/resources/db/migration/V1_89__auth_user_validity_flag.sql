alter table auth_user add column deleted boolean;

INSERT INTO metadata (table_name, column_name, sensitive) values ('auth_user', 'deleted', FALSE);