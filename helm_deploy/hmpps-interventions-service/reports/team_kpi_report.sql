WITH counts AS (
    SELECT count(r.id)                                                      AS count_of_started_referrals,
           count(r.id) FILTER ( WHERE r.sent_at IS NULL )                   AS count_of_draft_referrals,
           count(r.id) FILTER ( WHERE r.sent_at IS NOT NULL )               AS count_of_sent_referrals,
           count(r.id) FILTER ( WHERE r.concluded_at IS NOT NULL )          AS count_of_concluded_referrals,
           count(r.id) FILTER ( WHERE r.sent_at IS NOT NULL AND
                                      r.concluded_at IS NULL )              AS count_of_live_referrals,
           count(r.id) FILTER ( WHERE r.concluded_at IS NOT NULL AND
                                      r.end_requested_at IS NOT NULL AND
                                      eosr.submitted_at IS NULL )           AS count_of_cancelled_referrals,
           count(r.id) FILTER ( WHERE r.concluded_at IS NOT NULL AND
                                      r.end_requested_at IS NOT NULL AND
                                      eosr.submitted_at IS NOT NULL )       AS count_of_early_end_referrals,
           count(r.id) FILTER ( WHERE r.end_requested_reason_code = 'MIS' ) AS count_of_mistaken_referrals,
           count(r.sent_by_id)                                              AS count_of_pp_users_sending_referrals
    FROM referral r
             LEFT JOIN end_of_service_report eosr ON r.id = eosr.referral_id),

     times AS (
         SELECT avg(sent_at - created_at)                                            AS avg_completion_time,
                percentile_cont(0.50) within group ( order by sent_at - created_at ) AS p50_completion_time,
                percentile_cont(0.90) within group ( order by sent_at - created_at ) AS p90_completion_time,
                percentile_cont(0.95) within group ( order by sent_at - created_at ) AS p95_completion_time,
                percentile_cont(0.99) within group ( order by sent_at - created_at ) AS p99_completion_time
         FROM referral
         WHERE sent_at IS NOT NULL)

SELECT counts.count_of_started_referrals,
       counts.count_of_draft_referrals,
       counts.count_of_sent_referrals,
       counts.count_of_concluded_referrals,
       counts.count_of_live_referrals,
       counts.count_of_cancelled_referrals,
       counts.count_of_mistaken_referrals,
       counts.count_of_early_end_referrals,
       counts.count_of_pp_users_sending_referrals,
       case
           when counts.count_of_started_referrals = 0 then 0.0
           else 100.0 * counts.count_of_sent_referrals / counts.count_of_started_referrals
           end AS completion_rate_percent,
       times.avg_completion_time,
       times.p50_completion_time,
       times.p90_completion_time,
       times.p95_completion_time,
       times.p99_completion_time

FROM counts,
     times
