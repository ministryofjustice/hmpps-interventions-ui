delete from action_plan_activity;
delete from action_plan;

drop table action_plan_activity;

create table action_plan_activity (
    id uuid not null,
    action_plan_id uuid not null,
    desired_outcome_id uuid not null,
    description text not null,
    created_at timestamp with time zone not null,
	constraint pk_action_plan_activity primary key (id),
    constraint fk_action_plan_id foreign key (action_plan_id) references action_plan,
    constraint fk_desired_outcome_id foreign key (desired_outcome_id) references desired_outcome
);

create index idx_action_plan_id on action_plan_activity (action_plan_id);