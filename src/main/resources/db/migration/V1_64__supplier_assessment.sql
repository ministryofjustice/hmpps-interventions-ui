create table supplier_assessment(
    id uuid not null,
    referral_id uuid unique,
    constraint fk_supplier_assessment_referral foreign key (referral_id) references referral,
    primary key (id)
);

create table supplier_assessment_appointment (
      supplier_assessment_id uuid not null,
      appointment_id uuid not null,
      constraint fk_supplier_assessment_supplier_assessment foreign key (supplier_assessment_id) references supplier_assessment,
      constraint fk_supplier_assessment_appointments_appointment_id foreign key (appointment_id) references appointment,
      constraint uk_supplier_assessment_appointments_appointments_id unique (appointment_id),
      primary key (supplier_assessment_id, appointment_id)
);
