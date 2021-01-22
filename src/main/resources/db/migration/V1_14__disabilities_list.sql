alter table referral_service_user_data
    alter disabilities type text[] using array[disabilities];
