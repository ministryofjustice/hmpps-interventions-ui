package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

interface Engagement {
  val currentAppointment: Appointment
  val appointments: MutableSet<Appointment>
}
