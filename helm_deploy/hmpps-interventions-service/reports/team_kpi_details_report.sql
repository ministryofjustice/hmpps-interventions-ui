-- referrals by contract type
SELECT ct.name     AS contract_type,
       COUNT(r.id) AS number_of_sent_referrals
FROM referral r
         JOIN intervention i ON r.intervention_id = i.id
         JOIN dynamic_framework_contract c ON i.dynamic_framework_contract_id = c.id
         JOIN contract_type ct ON c.contract_type_id = ct.id
WHERE r.sent_at IS NOT NULL
GROUP BY ct.name
ORDER BY ct.name;

-- referrals by NPS region
SELECT nr.name     AS probation_region_including_PCCs,
       COUNT(r.id) AS number_of_sent_referrals
FROM referral r
         JOIN intervention i ON r.intervention_id = i.id
         JOIN dynamic_framework_contract c ON i.dynamic_framework_contract_id = c.id
         LEFT JOIN pcc_region pr ON c.pcc_region_id = pr.id
         LEFT JOIN nps_region nr ON (c.nps_region_id = nr.id OR pr.nps_region_id = nr.id)
WHERE r.sent_at IS NOT NULL
GROUP BY nr.name
ORDER BY nr.name;
