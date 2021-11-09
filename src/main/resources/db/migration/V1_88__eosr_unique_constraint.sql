CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS ix_unique_eosr_referral
    ON end_of_service_report (referral_id);
