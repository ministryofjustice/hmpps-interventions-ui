alter table referral
    add column further_information text,
    add column accessibility_needs text,
    add column additional_needs_information text,
    add column needs_interpreter boolean,
    add column interpreter_language text,
    add column has_additional_responsibilities boolean,
    add column when_unavailable text,
    add column additional_risk_information text;
