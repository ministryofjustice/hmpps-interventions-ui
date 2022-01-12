DELETE
FROM contract_type_service_category
-- Women's Support Services (GM)
WHERE contract_type_id = 'a93c152c-ed56-48f9-92e8-401ff7aa2fa8'
  AND service_category_id IN ('428ee70f-3001-4399-95a6-ad25eaaede16', -- Accommodation
                              '96a63c39-4371-4f17-a6ec-265755f0cf7b', -- Finance, Benefits and Debt
                              '76bcdb97-1dea-41c1-a4f8-899d88e5d679'); -- Dependency and Recovery
