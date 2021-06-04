UPDATE referral
    SET supplementary_risk_id = '00000000-0000-0000-0000-000000000000'
    WHERE supplementary_risk_id IS NULL AND sent_at IS NOT NULL;
