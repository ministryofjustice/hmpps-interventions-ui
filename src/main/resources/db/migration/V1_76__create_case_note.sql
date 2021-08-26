create table case_note (
  id uuid not null,
  referral_id uuid not null,
  subject text not null,
  body text not null,
  sent_at timestamp with time zone not null,
  sent_by_id text not null,
  primary key (id),
  constraint fk_case_note_referral_id foreign key (referral_id) references referral,
  constraint fk_case_note_sent_by_id foreign key (sent_by_id) references auth_user
);

