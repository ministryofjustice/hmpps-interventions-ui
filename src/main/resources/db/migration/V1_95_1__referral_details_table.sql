CREATE TABLE referral_details(
    id uuid not null,
    superseded_by_id uuid unique,
    created_at timestamp with time zone not null,
    created_by text not null,
    reason_for_change text,
    referral_id uuid not null,
    completion_deadline date,
    further_information text,
    maximum_enforceable_days int,

    primary key(id),
    foreign key (superseded_by_id) references referral_details(id)
);
create index idx_referral_detail_referral_id on referral_details (referral_id);

INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','id',FALSE, TRUE);
INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','superseded_by_id',FALSE, TRUE);
INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','created_at',FALSE, TRUE);
INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','created_by',FALSE, TRUE);
INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','reason_for_change',TRUE, TRUE);
INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','referral_id',FALSE, TRUE);
INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','completion_deadline',FALSE, TRUE);
INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','further_information',TRUE, TRUE);
INSERT INTO metadata (table_name, column_name, sensitive, domain_data) VALUES ('referral_details','maximum_enforceable_days',FALSE, TRUE);
