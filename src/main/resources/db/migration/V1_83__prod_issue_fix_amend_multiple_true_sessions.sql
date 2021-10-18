-- To fix referral: d7c7d7c1-df71-4501-9a0c-6649bcf31674.
-- Set action plan sessions to false for the old action plan: 98cdc3db-0493-45f5-9a4b-c19988c2cb9e
update action_plan_session set latest_approved = false where deprecated_action_plan_id = '98cdc3db-0493-45f5-9a4b-c19988c2cb9e';


-- To fix referral: 4a95bf60-f5ab-4470-8988-addd705f0d5c.
-- Set action plan sessions to false for the old action plan: 2732a0f8-0ba1-4de4-83e1-f1624a4164d1
update action_plan_session set latest_approved = false where deprecated_action_plan_id = '2732a0f8-0ba1-4de4-83e1-f1624a4164d1';
