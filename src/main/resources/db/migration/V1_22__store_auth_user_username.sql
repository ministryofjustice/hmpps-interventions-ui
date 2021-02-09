alter table auth_user
  add column user_name text not null default 'unknown';
