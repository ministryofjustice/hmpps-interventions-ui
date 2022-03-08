CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_appointment_referral ON appointment (referral_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_case_note_referral ON case_note (referral_id);
