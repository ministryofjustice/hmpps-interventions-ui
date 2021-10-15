insert into action_plan_session (id, session_number, deprecated_action_plan_id, referral_id, latest_approved)
select gen_random_uuid(), 6, 'b9cd89d0-6e6a-4856-8220-69fdb62732ea', 'c88ba538-aa56-442b-8aca-65582150a869', true WHERE EXISTS(select id from referral where id = 'c88ba538-aa56-442b-8aca-65582150a869');

insert into action_plan_session (id, session_number, deprecated_action_plan_id, referral_id, latest_approved)
select gen_random_uuid(), 7, 'b9cd89d0-6e6a-4856-8220-69fdb62732ea', 'c88ba538-aa56-442b-8aca-65582150a869', true WHERE EXISTS(select id from referral where id = 'c88ba538-aa56-442b-8aca-65582150a869');

insert into action_plan_session (id, session_number, deprecated_action_plan_id, referral_id, latest_approved)
select gen_random_uuid(), 8, 'b9cd89d0-6e6a-4856-8220-69fdb62732ea', 'c88ba538-aa56-442b-8aca-65582150a869', true WHERE EXISTS(select id from referral where id = 'c88ba538-aa56-442b-8aca-65582150a869');