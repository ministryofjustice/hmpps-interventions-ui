create table supplier_assessment(
    id uuid not null,
    referral_id uuid,
    constraint fk_supplier_assessment_referral foreign key (referral_id) references referral,
    primary key (id)
);

create table supplier_assessment_appointments (
      supplier_assessment_id uuid not null,
      appointments_id uuid not null,
      constraint fk_supplier_assessment_supplier_assessment foreign key (supplier_assessment_id) references supplier_assessment,
      constraint fk_supplier_assessment_appointments_appointment_id foreign key (appointments_id) references appointment,
      constraint uk_supplier_assessment_appointments_appointments_id unique (appointments_id),
      primary key (supplier_assessment_id, appointments_id)
);
