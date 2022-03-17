CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS referral_details_superseded_ix ON referral_details (superseded_by_id) WHERE superseded_by_id IS NOT NULL;
