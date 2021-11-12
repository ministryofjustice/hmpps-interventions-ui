create table draft_oasys_risk_information(
    referral_id uuid not null,
    updated_at timestamp with time zone not null,
    updated_by_id text not null,
    risk_summary_who_is_at_risk text,
    risk_summary_nature_of_risk text,
    risk_summary_risk_imminence text,
    risk_to_self_suicide text,
    risk_to_self_self_harm text,
    risk_to_self_hostel_setting text,
    risk_to_self_vulnerability text,
    additional_information text,
    primary key(referral_id),
    constraint fk_draft_oasys_risk_information_referral_id foreign key (referral_id) references referral,
    constraint fk_case_note_updated_by_id foreign key (updated_by_id) references auth_user
);

INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','referral_id',FALSE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','updated_at',FALSE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','updated_by_id',FALSE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','risk_summary_who_is_at_risk',TRUE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','risk_summary_nature_of_risk',TRUE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','risk_summary_risk_imminence',TRUE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','risk_to_self_suicide',TRUE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','risk_to_self_self_harm',TRUE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','risk_to_self_hostel_setting',TRUE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','risk_to_self_vulnerability',TRUE);
INSERT INTO metadata (table_name, column_name, sensitive) VALUES ('draft_oasys_risk_information','additional_information',TRUE);