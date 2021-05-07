COPY (
  SELECT
    r.reference_number      AS referral_ref,
    r.id                    AS referral_id,
    c.contract_reference    AS crs_contract_reference,
    'coming-later'          AS crs_contract_type,
    prime.id                AS crs_provider_id,
    r.sent_by_id            AS referring_officer_id,
    r.relevant_sentence_id  AS relevant_sentence_id,
    r.service_usercrn       AS service_user_crn,
    r.sent_at               AS date_referral_received,
    'coming-later'          AS date_saa_booked,
    'coming-later'          AS date_saa_attended,
    ap.submitted_at         AS date_first_action_plan_submitted,
    'coming-later'          AS date_of_first_action_plan_approval,
    r.assigned_to_id        AS caseworker_id,
    (
      select min(app.appointment_time)
      from action_plan_appointment app
      where app.action_plan_id = ap.id and attended in ('YES', 'LATE')
    )                       AS date_of_first_session,
    (
      select count(o.desired_outcome_id)
      from referral_desired_outcome o
      where o.referral_id = r.id
    )                       AS outcomes_to_be_achieved_count,
    'coming-later'          AS outcomes_progress,
    ap.number_of_sessions   AS count_of_sessions_expected,
    (
      select count(app.id)
      from action_plan_appointment app
      where app.action_plan_id = ap.id and attended in ('YES', 'LATE')
    )                       AS count_of_sessions_attended,
    r.concluded_at          AS date_intervention_ended,
    eosr.submitted_at       AS date_end_of_service_report_submitted
  FROM
    referral r
    JOIN intervention i ON (r.intervention_id = i.id)
    JOIN dynamic_framework_contract c ON (i.dynamic_framework_contract_id = c.id)
    JOIN service_provider prime ON (c.service_provider_id = prime.id)
    LEFT JOIN action_plan ap ON (ap.referral_id = r.id) --❗️assumes a SINGLE action plan
    LEFT JOIN end_of_service_report eosr ON (eosr.referral_id = r.id)
  WHERE
    r.sent_at IS NOT NULL
  ORDER BY
    r.sent_at
) TO STDOUT WITH CSV HEADER
