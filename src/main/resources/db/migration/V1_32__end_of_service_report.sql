create table end_of_service_report (
    id uuid not null,
    created_at timestamp with time zone not null,
    created_by_id text not null,
    submitted_at timestamp with time zone,
    submitted_by_id text,
    further_information text,

	constraint pk_end_of_service_report primary key (id),
    constraint fk_created_by_id foreign key (created_by_id) references auth_user,
    constraint fk_submitted_by_id foreign key (submitted_by_id) references auth_user
);

create table end_of_service_report_outcome (
    end_of_service_report_id uuid not null,
    desired_outcome_id uuid not null,
    achievement_level text not null,
    progression_comments text,
    additional_task_comments text,

    constraint fk_end_of_service_report_id foreign key (end_of_service_report_id) references end_of_service_report,
    constraint fk_desired_outcome_id foreign key (desired_outcome_id) references desired_outcome
);


alter table referral
    add column end_of_service_report_id uuid unique,
    add constraint fk_end_of_service_report_id foreign key (end_of_service_report_id) references end_of_service_report;
