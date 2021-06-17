package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryAddress
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import java.util.UUID

class AppointmentDeliveryAddressFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  val appointmentDeliveryFactory = AppointmentDeliveryFactory(em)
  fun create(
    appointmentDeliveryId: UUID? = null,
    firstAddressLine: String = "Harmony Living Office, Room 4",
    secondAddressLine: String? = "44 Bouverie Road",
    townCity: String = "Blackpool",
    county: String = "Lancashire",
    postCode: String = "SY4 0RE",
  ): AppointmentDeliveryAddress {
    var id = appointmentDeliveryId
    if (id == null) {
      id = appointmentDeliveryFactory.create(appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER).appointmentId
    }
    return save(
      AppointmentDeliveryAddress(
        appointmentDeliveryId = id,
        firstAddressLine = firstAddressLine,
        secondAddressLine = secondAddressLine,
        townCity = townCity,
        county = county,
        postCode = postCode
      )
    )
  }
}
