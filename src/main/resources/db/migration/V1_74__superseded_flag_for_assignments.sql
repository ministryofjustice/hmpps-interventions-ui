-- to enable querying the single "live" entry via `AND superseded = false`
ALTER TABLE referral_assignments
    ADD COLUMN superseded bool NOT NULL DEFAULT false;

-- migrating the values to "true" will be done in a subsequent deploy, to avoid race conditions where
-- • we migrate the data
-- • assignments happen with the old code not using `superseded`
-- • then new code takes over

-- instead, we'll deploy in one go, _then_ migrate all the old data once the new code is live and ensures consistency
