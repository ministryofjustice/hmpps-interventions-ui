INSERT INTO contract_type (id, name, code)
VALUES ('bc65434d-089b-4c37-80c2-50efebb76933', 'Mentoring', 'MTR')
     , ('5a7d2856-2126-478d-ab12-afcc07deb977', 'Dependency and Recovery', 'DNR')
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', 'Women''s Support Services (GM)', 'WSM');

INSERT INTO service_category (id, created, name)
VALUES ('9232541b-6b1c-455d-8153-ab2784bf4593', NOW(), 'Family and Significant Others (GM)');

INSERT INTO contract_type_service_category (contract_type_id, service_category_id)
-- Mentoring
VALUES ('bc65434d-089b-4c37-80c2-50efebb76933', 'b84f4eb7-4db0-477e-8c59-21027b3262c5') -- Lifestyle and Associates
     , ('bc65434d-089b-4c37-80c2-50efebb76933', 'c036826e-f077-49a5-8b33-601dca7ad479') -- Social Inclusion
-- Dependency and Recovery
     , ('5a7d2856-2126-478d-ab12-afcc07deb977', '76bcdb97-1dea-41c1-a4f8-899d88e5d679') -- Dependency and Recovery
-- Women's Support Services (GM)
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', '428ee70f-3001-4399-95a6-ad25eaaede16') -- Accommodation
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', 'ca374ac3-84eb-4b91-bea7-9005398f426f') -- ETE
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', '96a63c39-4371-4f17-a6ec-265755f0cf7b') -- Finance, Benefits and Debt
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', '76bcdb97-1dea-41c1-a4f8-899d88e5d679') -- Dependency and Recovery
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', 'b84f4eb7-4db0-477e-8c59-21027b3262c5') -- Lifestyle and Associates
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', '8221a81c-08b2-4262-9c1a-0ab3c82cec8c') -- Emotional Wellbeing
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', 'c036826e-f077-49a5-8b33-601dca7ad479') -- Social Inclusion
     , ('a93c152c-ed56-48f9-92e8-401ff7aa2fa8', '9232541b-6b1c-455d-8153-ab2784bf4593') -- New GM service category
;

INSERT INTO desired_outcome (id, service_category_id, description)
-- Family and Significant Others (GM)
VALUES ('518c70c3-8f42-4ad6-a50d-f9e92d366059', '9232541b-6b1c-455d-8153-ab2784bf4593',
        'Service User develops or maintains positive family relationships and avoids harmful relationships.')
     , ('9823356e-ff3b-4b29-9d6e-bc3065b067c1', '9232541b-6b1c-455d-8153-ab2784bf4593',
        'Service User demonstrates confident and responsible parenting behaviours (where applicable).')
     , ('bcb7309f-62a8-49ba-894d-3e627f0993e0', '9232541b-6b1c-455d-8153-ab2784bf4593',
        'Service User improves ability to develop positive intimate relationships including communication, resilience, negotiation and assertiveness skills.')
     , ('6f97a384-457d-4fc9-aa09-e30dad38d6bc', '9232541b-6b1c-455d-8153-ab2784bf4593',
        'Service User demonstrates positive coping strategies in the event of temporary or irretrievable breakdown of familial or other relationships.')
     , ('169824c2-ae25-4392-bf59-c74ae4591e30', '9232541b-6b1c-455d-8153-ab2784bf4593',
        'Service User complies with any voluntary or mandatory family or relationship-focussed therapeutic/behavioural change programmes.')
-- This is the extra one for Greater Manchester, the above are copies with new IDs
     , ('d2df75af-0850-4e65-bd86-22b8f34067d3', '9232541b-6b1c-455d-8153-ab2784bf4593',
        'Offer the family or significant other guidance, support, and signposting regarding Finance Benefits Debt, accommodation, children’s services and service user’s release from custody to family home.')
;

INSERT INTO complexity_level (id, service_category_id, title, description)
-- Family and Significant Others (GM), copies with new IDs
VALUES ('b948a17e-6334-4a68-915c-a2f8b0066a7a', '9232541b-6b1c-455d-8153-ab2784bf4593', 'Low complexity',
        'Service User has positive contact with some family or some significant others and may have positive support of family members. Service User has previously lost contact with family and recently renewed contacts but there remain some difficulties.')
     , ('f7d11ff0-e198-4241-9221-816ace3fbfab', '9232541b-6b1c-455d-8153-ab2784bf4593', 'Medium complexity',
        'Service User describes more difficulties in relationships with family and significant others or is in the process of resolving difficulties. Service User has a mix of good and difficult relationships with family and significant others.')
     , ('2e8db418-35c7-401f-bfd5-ad6cc44b3b63', '9232541b-6b1c-455d-8153-ab2784bf4593', 'High complexity',
        'Service User has little or no contact with family and does not care about what family thinks feel or expects. Service User describes hostile, indifferent uncaring relationships with family and significant others. Service User''s relationship has recently ended or is likely to do so.')
;
