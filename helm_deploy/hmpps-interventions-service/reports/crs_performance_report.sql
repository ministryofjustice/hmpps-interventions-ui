COPY (
  WITH attended_sessions AS (
      select count(app.id) AS attended, min(app.appointment_time) as first_appointment, aps.action_plan_id
      from appointment app
        join action_plan_session_appointment apsa on app.id = apsa.appointment_id
        join action_plan_session aps on apsa.action_plan_session_id = aps.id
      where attended in ('YES', 'LATE')
      group by aps.action_plan_id
  ),
  attempted_sessions AS (
      select count(app.id) AS attempted, aps.action_plan_id
      from appointment app
        join action_plan_session_appointment apsa on app.id = apsa.appointment_id
        join action_plan_session aps on apsa.action_plan_session_id = aps.id
      where attended IS NOT NULL
      group by aps.action_plan_id
  ),
  first_submitted_action_plans AS (
    select referral_id, min(submitted_at) as submitted_at
    from action_plan
    group by referral_id
  ),
  first_approved_action_plans AS (
     select referral_id, min(approved_at) as approved_at
     from action_plan
     group by referral_id
  ),
  current_action_plans AS (
      select id, referral_id, number_of_sessions from action_plan
      where (referral_id, created_at) in
        (
          select referral_id, max(created_at)
          from action_plan
          group by referral_id
        )
  )
  SELECT
    r.reference_number      AS referral_ref,
    r.id                    AS referral_id,
    c.contract_reference    AS crs_contract_reference,
    ct.code                 AS crs_contract_type,
    prime.id                AS crs_provider_id,
    r.sent_by_id            AS referring_officer_id,
    r.relevant_sentence_id  AS relevant_sentence_id,
    r.service_usercrn       AS service_user_crn,
    r.sent_at               AS date_referral_received,
    TIMESTAMP WITH TIME ZONE '3000-01-01+00' AS date_saa_booked,                    -- default value, coming later
    TIMESTAMP WITH TIME ZONE '3000-01-01+00' AS date_saa_attended,                  -- default value, coming later
    fsap.submitted_at       AS date_first_action_plan_submitted,
    faap.approved_at        AS date_of_first_action_plan_approval,
    shows.first_appointment AS date_of_first_session,
    (
      select count(o.desired_outcome_id)
      from referral_desired_outcome o
      where o.referral_id = r.id
    )                       AS outcomes_to_be_achieved_count,
    9000                    AS outcomes_progress,                                   -- default value, coming later
    cap.number_of_sessions   AS count_of_sessions_expected,
    shows.attended          AS count_of_sessions_attended,
    r.concluded_at          AS date_intervention_ended,
    (
      CASE
        -- ❗️ need to confirm if we need to only select the 'latest' of the session appointment
        -- example: session no.2. has (yesterday: missed, today: pending) appointment -- do we say 1 or 0?
        WHEN r.concluded_at IS NOT NULL AND eosr.id IS NULL THEN 'cancelled'
        WHEN r.concluded_at IS NOT NULL AND eosr.id IS NOT NULL AND cap.number_of_sessions > atts.attempted THEN 'ended'
        WHEN r.concluded_at IS NOT NULL AND eosr.id IS NOT NULL AND cap.number_of_sessions = atts.attempted THEN 'completed'
      END
    )                       AS intervention_end_reason,
    eosr.submitted_at       AS date_end_of_service_report_submitted
  FROM
    referral r
    JOIN intervention i ON (r.intervention_id = i.id)
    JOIN dynamic_framework_contract c ON (i.dynamic_framework_contract_id = c.id)
    JOIN contract_type ct ON (c.contract_type_id = ct.id)
    JOIN service_provider prime ON (c.prime_provider_id = prime.id)
    LEFT JOIN first_submitted_action_plans fsap ON (fsap.referral_id = r.id)
    LEFT JOIN first_approved_action_plans faap ON (faap.referral_id = r.id)
    LEFT JOIN current_action_plans cap ON (cap.referral_id = r.id)
    LEFT JOIN attended_sessions shows ON (shows.action_plan_id = cap.id) --❗️should be linked to referrals instead, sessions are static
    LEFT JOIN attempted_sessions atts ON (atts.action_plan_id = cap.id) --❗️should be linked to referrals instead, sessions are static
    LEFT JOIN end_of_service_report eosr ON (eosr.referral_id = r.id)
  WHERE
    r.sent_at IS NOT NULL
  ORDER BY
    r.sent_at
) TO STDOUT WITH CSV HEADER
