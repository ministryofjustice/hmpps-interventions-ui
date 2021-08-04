package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDelivery
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import java.util.UUID

class AppointmentDeliveryFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val appointmentFactory = AppointmentFactory(em)

  fun create(
    appointmentId: UUID? = null,
    npsOfficeCode: String? = null,
    appointmentDeliveryType: AppointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL,
    appointmentSessionType: AppointmentSessionType = AppointmentSessionType.ONE_TO_ONE,
  ): AppointmentDelivery {
    var id = appointmentId
    if (id == null) {
      id = appointmentFactory.create().id
    }
    return save(
      AppointmentDelivery(
        appointmentId = id,
        appointmentDeliveryType = appointmentDeliveryType,
        appointmentSessionType = appointmentSessionType,
        npsOfficeCode = npsOfficeCode,
      )
    )
  }
}
