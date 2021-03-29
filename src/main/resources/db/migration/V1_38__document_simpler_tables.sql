COMMENT ON TABLE auth_user IS 'details about the user from hmpps-auth';
COMMENT ON COLUMN auth_user.id IS 'the user ID';
COMMENT ON COLUMN auth_user.auth_source IS 'where the user has come from';
COMMENT ON COLUMN auth_user.user_name IS 'the username';

COMMENT ON TABLE service_category IS '[reference data] intervention service categories, which relate to service user needs';
COMMENT ON COLUMN service_category.id IS 'service-owned unique identifier';
COMMENT ON COLUMN service_category.created IS 'when the record was added';
COMMENT ON COLUMN service_category.name IS 'intervention service category';

COMMENT ON TABLE complexity_level IS '[reference data] complexity levels for each intervention service category';
COMMENT ON COLUMN complexity_level.id IS 'service-owned unique identifier';
COMMENT ON COLUMN complexity_level.service_category_id IS 'the ID of the intervention service category it belongs to';
COMMENT ON COLUMN complexity_level.title IS 'complexity level of needs, usually: low, medium, high';
COMMENT ON COLUMN complexity_level.description IS 'rationale for the complexity level';

COMMENT ON TABLE desired_outcome IS '[reference data] desired outcomes available for each intervention service category';
COMMENT ON COLUMN desired_outcome.id IS 'service-owned unique identifier';
COMMENT ON COLUMN desired_outcome.service_category_id IS 'the ID of the intervention service category it belongs to';
COMMENT ON COLUMN desired_outcome.description IS 'describes what the outcome should be for the service user';

COMMENT ON TABLE nps_region IS '[reference data] National Probation Service (NPS) region details';
COMMENT ON COLUMN nps_region.id IS 'the ID of the NPS region unique identifier';
COMMENT ON COLUMN nps_region.name IS 'NPS region name';

COMMENT ON TABLE pcc_region IS '[reference data] Police and Crime Commissioner (PCC) region details';
COMMENT ON COLUMN pcc_region.id IS 'PCC region unique identifier';
COMMENT ON COLUMN pcc_region.name IS 'PCC region name';
COMMENT ON COLUMN pcc_region.nps_region_id IS 'the ID of the National Probation Service (NPS) region the PCC is in';
