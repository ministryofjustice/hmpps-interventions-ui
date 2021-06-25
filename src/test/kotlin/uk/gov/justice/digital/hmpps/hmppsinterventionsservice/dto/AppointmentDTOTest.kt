package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentDeliveryAddressFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentDeliveryFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory

internal class AppointmentDTOTest {
  private val appointmentFactory = AppointmentFactory()
  private val appointmentDeliveryFactory = AppointmentDeliveryFactory()
  private val appointmentDeliveryAddressFactory = AppointmentDeliveryAddressFactory()
  @Test
  fun `Maps from an appointment`() {
    val appointment = appointmentFactory.create()
    val appointmentDelivery = appointmentDeliveryFactory.create(appointmentId = appointment.id, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER)
    val appointmentDeliveryAddress = appointmentDeliveryAddressFactory.create(appointmentDeliveryId = appointmentDelivery.appointmentId, secondAddressLine = null, townCity = null, county = null, postCode = "SY4 0RE")
    appointment.appointmentDelivery = appointmentDelivery
    appointmentDelivery.appointmentDeliveryAddress = appointmentDeliveryAddress
    val appointmentDTO = AppointmentDTO.from(appointment)
    Assertions.assertThat(appointmentDTO.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.IN_PERSON_MEETING_OTHER)
    Assertions.assertThat(appointmentDTO.appointmentDeliveryAddress?.firstAddressLine).isEqualTo("Harmony Living Office, Room 4")
    Assertions.assertThat(appointmentDTO.appointmentDeliveryAddress?.secondAddressLine).isNull()
    Assertions.assertThat(appointmentDTO.appointmentDeliveryAddress?.townOrCity).isNull()
    Assertions.assertThat(appointmentDTO.appointmentDeliveryAddress?.county).isNull()
    Assertions.assertThat(appointmentDTO.appointmentDeliveryAddress?.postCode).isEqualTo("SY40RE")
  }
}
