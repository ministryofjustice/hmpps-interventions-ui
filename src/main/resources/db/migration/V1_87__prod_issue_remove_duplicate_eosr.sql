-- This is to remove a duplicate end of service report in prod.
delete from end_of_service_report
where id = '22f417f8-7faf-498a-bd3b-6d0e0cedb71f';
