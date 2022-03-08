insert into referral_details (id, superseded_by_id, created_at, created_by, reason_for_change, referral_id, completion_deadline, further_information, maximum_enforceable_days)
      select
            gen_random_uuid(),
            null,
            now(),
            'migration',
            'initial value',
            ref.id,
            ref.completion_deadline,
            ref.further_information,
            ref.maximum_enforceable_days
         from
             referral ref
;
