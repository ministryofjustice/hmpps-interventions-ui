package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "appointment_delivery_address")
data class AppointmentDeliveryAddress(
  @Id
  var appointmentDeliveryId: UUID,
  var firstAddressLine: String,
  var secondAddressLine: String? = null,
  var townCity: String? = null,
  var county: String? = null,
  var postCode: String,
)
