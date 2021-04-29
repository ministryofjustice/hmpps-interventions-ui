alter table referral
    rename column ended_at to end_requested_at;

alter table referral
    rename column ended_by_id to end_requested_by_id;

alter table referral
    rename column cancellation_reason_code to end_requested_reason_code;

alter table referral
    rename column cancellation_comments to end_requested_comments;