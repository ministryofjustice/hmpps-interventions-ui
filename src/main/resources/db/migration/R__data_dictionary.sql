COMMENT ON TABLE auth_user IS 'details about the user from hmpps-auth';
COMMENT ON COLUMN auth_user.id IS 'the user ID';
COMMENT ON COLUMN auth_user.auth_source IS 'where the user has come from';
COMMENT ON COLUMN auth_user.user_name IS 'the username';
COMMENT ON COLUMN auth_user.deleted IS 'soft deleted flag';

COMMENT ON TABLE service_category IS '**reference data** intervention service categories, which relate to service user needs';
COMMENT ON COLUMN service_category.id IS 'service-owned unique identifier';
COMMENT ON COLUMN service_category.created IS 'when the record was added';
COMMENT ON COLUMN service_category.name IS 'intervention service category';

COMMENT ON TABLE complexity_level IS '**reference data** complexity levels for each intervention service category';
COMMENT ON COLUMN complexity_level.id IS 'service-owned unique identifier';
COMMENT ON COLUMN complexity_level.service_category_id IS 'the ID of the intervention service category it belongs to';
COMMENT ON COLUMN complexity_level.title IS 'complexity level of needs, usually: low, medium, high';
COMMENT ON COLUMN complexity_level.description IS 'rationale for the complexity level';

COMMENT ON TABLE desired_outcome IS '**reference data** desired outcomes available for each intervention service category';
COMMENT ON COLUMN desired_outcome.id IS 'service-owned unique identifier';
COMMENT ON COLUMN desired_outcome.service_category_id IS 'the ID of the intervention service category it belongs to';
COMMENT ON COLUMN desired_outcome.description IS 'describes what the outcome should be for the service user';

COMMENT ON TABLE nps_region IS '**reference data** National Probation Service (NPS) region details';
COMMENT ON COLUMN nps_region.id IS 'the ID of the NPS region unique identifier';
COMMENT ON COLUMN nps_region.name IS 'NPS region name';

COMMENT ON TABLE pcc_region IS '**reference data** Police and Crime Commissioner (PCC) region details';
COMMENT ON COLUMN pcc_region.id IS 'PCC region unique identifier';
COMMENT ON COLUMN pcc_region.name IS 'PCC region name';
COMMENT ON COLUMN pcc_region.nps_region_id IS 'the ID of the National Probation Service (NPS) region the PCC is in';

COMMENT ON TABLE service_provider IS 'service provider details';
COMMENT ON COLUMN service_provider.id IS 'service provider unique identifier, used in hmpps-auth as group code';
COMMENT ON COLUMN service_provider.name IS 'service provider name';

COMMENT ON TABLE intervention IS 'intervention details';
COMMENT ON COLUMN intervention.id IS 'intervention unique identifier';
COMMENT ON COLUMN intervention.dynamic_framework_contract_id IS 'dynamic framework unique identifier';
COMMENT ON COLUMN intervention.created_at IS 'when the record was added';
COMMENT ON COLUMN intervention.title IS 'intervention name';
COMMENT ON COLUMN intervention.description IS 'intervention description';
COMMENT ON COLUMN intervention.incoming_referral_distribution_email IS 'email address receiving notifications about new referrals';

COMMENT ON TABLE referral IS 'referral details';
COMMENT ON COLUMN referral.id IS 'referral unique identifier';
COMMENT ON COLUMN referral.intervention_id IS 'intervention unique identifier';
COMMENT ON COLUMN referral.created_at IS 'when the referral was started';
COMMENT ON COLUMN referral.created_by_id IS 'ID of the person who started the referral';
COMMENT ON COLUMN referral.service_usercrn IS 'the referred person''s probation Case Reference Number';
COMMENT ON COLUMN referral.completion_deadline IS 'when the intervention should be completed by';
COMMENT ON COLUMN referral.further_information IS 'further information about the service user';
COMMENT ON COLUMN referral.accessibility_needs IS 'accessibility needs of the service user';
COMMENT ON COLUMN referral.additional_needs_information IS 'further information about the service user''s needs';
COMMENT ON COLUMN referral.needs_interpreter IS 'whether the service user needs an interpreter';
COMMENT ON COLUMN referral.interpreter_language IS 'what language the interpreter should speak';
COMMENT ON COLUMN referral.has_additional_responsibilities IS 'if the service user has attitional responsibilities in their life';
COMMENT ON COLUMN referral.when_unavailable IS 'when the service user is unavailable due to existing commitments';
COMMENT ON COLUMN referral.draft_supplementary_risk IS 'draft supplementary risk information about the service user; this is deleted and stored in ''assess risk and needs'' service when the referral is sent';
COMMENT ON COLUMN referral.draft_supplementary_risk_updated_at IS 'a timestamp indicating the last time the draft supplementary risk was updated';
COMMENT ON COLUMN referral.supplementary_risk_id IS 'ID of the supplementary risk information stored in ''assess risks and needs'' service for this referral';
COMMENT ON COLUMN referral.maximum_enforceable_days IS 'the maximum number of enforceable/RAR days that can be used';
COMMENT ON COLUMN referral.reference_number IS 'referral number';
COMMENT ON COLUMN referral.sent_at IS 'when the referral was sent';
COMMENT ON COLUMN referral.sent_by_id IS 'ID of the person who sent the referral';

COMMENT ON TABLE referral_assignments IS 'snapshots of referral assignments';
COMMENT ON COLUMN referral_assignments.referral_id IS 'the referral being assigned';
COMMENT ON COLUMN referral_assignments.assigned_at IS 'when the case was assigned';
COMMENT ON COLUMN referral_assignments.assigned_by_id IS 'ID of the person who assigned the case';
COMMENT ON COLUMN referral_assignments.assigned_to_id IS 'ID of the person who the case is assigned to';

COMMENT ON TABLE referral_desired_outcome IS 'desired outcome details';
COMMENT ON COLUMN referral_desired_outcome.referral_id IS 'referral unique identifier';
COMMENT ON COLUMN referral_desired_outcome.desired_outcome_id IS 'desired outcome unique identifier';

COMMENT ON TABLE referral_service_user_data IS 'referral service user details';
COMMENT ON COLUMN referral_service_user_data.referral_id IS 'referral unique identifier';
COMMENT ON COLUMN referral_service_user_data.disabilities IS 'information about disabilities';
COMMENT ON COLUMN referral_service_user_data.dob IS 'date of birth';
COMMENT ON COLUMN referral_service_user_data.ethnicity IS 'ethnicity';
COMMENT ON COLUMN referral_service_user_data.first_name IS 'service user''s first name';
COMMENT ON COLUMN referral_service_user_data.last_name IS 'service user''s last name';
COMMENT ON COLUMN referral_service_user_data.preferred_language IS 'the preferred language of the service user';
COMMENT ON COLUMN referral_service_user_data.religion_or_belief IS 'the religion or belief system of the service user';
COMMENT ON COLUMN referral_service_user_data.gender IS 'the service user''s gender';
COMMENT ON COLUMN referral_service_user_data.title IS 'the service user''s title';

COMMENT ON TABLE action_plan IS 'service user''s action plan details';
COMMENT ON COLUMN action_plan.id IS 'service user''s action plan unique identifier';
COMMENT ON COLUMN action_plan.referral_id IS 'service user''s action plan referral unique identifier';
COMMENT ON COLUMN action_plan.number_of_sessions IS 'number of sessions the service user will have';
COMMENT ON COLUMN action_plan.created_by_id IS 'who the service user''s action plan was created by';
COMMENT ON COLUMN action_plan.created_at IS 'when the service user''s action plan was created';
COMMENT ON COLUMN action_plan.submitted_at IS 'when the service user''s action plan was submitted for approval';
COMMENT ON COLUMN action_plan.submitted_by_id IS 'who submitted the service user''s action plan';
COMMENT ON COLUMN action_plan.approved_at IS 'when the service user''s action plan was approved';
COMMENT ON COLUMN action_plan.approved_by_id IS 'who approved the service user''s action plan';

COMMENT ON TABLE action_plan_activity IS 'service user''s action plan activity details';
COMMENT ON COLUMN action_plan_activity.id IS 'service user''s action plan activity unique identifier';
COMMENT ON COLUMN action_plan_activity.action_plan_id IS 'service user''s action plan unique identifier';
COMMENT ON COLUMN action_plan_activity.description IS 'description of the activity';
COMMENT ON COLUMN action_plan_activity.created_at IS 'when the service user''s action plan was created';

COMMENT ON TABLE appointment_delivery IS 'appointment delivery details';
COMMENT ON COLUMN appointment_delivery.appointment_id IS 'appointment''s unique identifier';
COMMENT ON COLUMN appointment_delivery.appointment_delivery_type IS 'type to denote how the appointment is delivered';
COMMENT ON COLUMN appointment_delivery.nps_office_code IS 'National Probation Service office code if the appointment delivery type is ''IN_PERSON_MEETING_PROBATION_OFFICE''';

COMMENT ON TABLE appointment_delivery_address IS 'appointment location address if the appointment delivery type is ''IN_PERSON_MEETING_OTHER''';
COMMENT ON COLUMN appointment_delivery_address.appointment_delivery_id IS 'appointment delivery''s unique identifier';
COMMENT ON COLUMN appointment_delivery_address.first_address_line IS 'first address line appointment delivery address location';
COMMENT ON COLUMN appointment_delivery_address.second_address_line IS 'second address line of appointment delivery address location';
COMMENT ON COLUMN appointment_delivery_address.town_city IS 'town or city of appointment delivery address location';
COMMENT ON COLUMN appointment_delivery_address.county IS 'county of appointment delivery address location';
COMMENT ON COLUMN appointment_delivery_address.post_code IS 'postcode of appointment delivery address location';


COMMENT ON TABLE case_note IS 'case note provided by officer for a referral';
COMMENT ON COLUMN case_note.referral_id IS 'referral connected to this case note';
COMMENT ON COLUMN case_note.subject IS 'subject of the case note';
COMMENT ON COLUMN case_note.body IS 'main body text of the case note';
COMMENT ON COLUMN case_note.sent_at IS 'date time for when the case note was created';
COMMENT ON COLUMN case_note.sent_by_id IS 'the officer who created the case note';

COMMENT ON TABLE metadata IS 'defines metadata about the schema';
COMMENT ON COLUMN metadata.table_name IS 'which table this record is describing';
COMMENT ON COLUMN metadata.column_name IS 'which column this record is describing';
COMMENT ON COLUMN metadata.sensitive IS '`true` means the contents should be obfuscated/anonymised in unsafe environments; `false` means it’s safe to see/copy';
COMMENT ON COLUMN metadata.domain_data IS '`true` means the field hold operational/domain data; `false` means it is an internal structure that holds no operational data';

COMMENT ON TABLE draft_oasys_risk_information IS 'holds draft OASYS risk information only for a DraftReferral. Discarded after referral is sent.';
COMMENT ON COLUMN draft_oasys_risk_information.referral_id IS 'the id of the draft referral connected to risk information';
COMMENT ON COLUMN draft_oasys_risk_information.updated_at IS 'when the draft oasys risk information was last updated';
COMMENT ON COLUMN draft_oasys_risk_information.updated_by_id IS 'who updated the draft oasys risk information';
COMMENT ON COLUMN draft_oasys_risk_information.risk_summary_who_is_at_risk IS 'OASYS Risk Summary - who is at risk?';
COMMENT ON COLUMN draft_oasys_risk_information.risk_summary_nature_of_risk IS 'OASYS Risk Summary - nature of risk';
COMMENT ON COLUMN draft_oasys_risk_information.risk_summary_risk_imminence IS 'OASYS Risk Summary - risk imminence';
COMMENT ON COLUMN draft_oasys_risk_information.risk_to_self_suicide IS 'OASYS Risk to Self - suicide';
COMMENT ON COLUMN draft_oasys_risk_information.risk_to_self_self_harm IS 'OASYS Risk to Self - self harm';
COMMENT ON COLUMN draft_oasys_risk_information.risk_to_self_hostel_setting IS 'OASYS Risk to Self - hostel setting';
COMMENT ON COLUMN draft_oasys_risk_information.risk_to_self_vulnerability IS 'OASYS Risk to Self - vulnerability';
COMMENT ON COLUMN draft_oasys_risk_information.additional_information IS 'OASYS Additional risk information';
