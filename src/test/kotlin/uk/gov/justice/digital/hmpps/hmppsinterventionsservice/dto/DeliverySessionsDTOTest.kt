package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentDeliveryAddressFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentDeliveryFactory

internal class DeliverySessionsDTOTest {
  private val deliverySessionFactory = DeliverySessionFactory()
  private val appointmentDeliveryFactory = AppointmentDeliveryFactory()
  private val appointmentDeliveryAddressFactory = AppointmentDeliveryAddressFactory()
  @Test
  fun `Maps from a session`() {
    val session = deliverySessionFactory.createScheduled()
    val sessionDTO = DeliverySessionDTO.from(session)

    assertThat(sessionDTO.id).isEqualTo(session.id)
    assertThat(sessionDTO.sessionNumber).isEqualTo(session.sessionNumber)
    assertThat(sessionDTO.appointmentTime).isEqualTo(session.currentAppointment?.appointmentTime)
    assertThat(sessionDTO.durationInMinutes).isEqualTo(session.currentAppointment?.durationInMinutes)
  }

  @Test
  fun `Maps from a list of sessions`() {
    val session = deliverySessionFactory.createScheduled()
    val sessionsDTO = DeliverySessionDTO.from(listOf(session))

    assertThat(sessionsDTO.size).isEqualTo(1)
    assertThat(sessionsDTO.first().id).isEqualTo(session.id)
    assertThat(sessionsDTO.first().sessionNumber).isEqualTo(session.sessionNumber)
    assertThat(sessionsDTO.first().appointmentTime).isEqualTo(session.currentAppointment?.appointmentTime)
    assertThat(sessionsDTO.first().durationInMinutes).isEqualTo(session.currentAppointment?.durationInMinutes)
    assertThat(sessionsDTO.first().appointmentDeliveryType).isNull()
    assertThat(sessionsDTO.first().appointmentDeliveryAddress).isNull()
  }

  @Test
  fun `Maps from a session with phone call`() {
    val session = deliverySessionFactory.createScheduled()
    session.appointments.first().appointmentDelivery = appointmentDeliveryFactory.create(session.appointments.first().id, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL)
    val sessionDTO = DeliverySessionDTO.from(session)
    assertThat(sessionDTO.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.PHONE_CALL)
    assertThat(sessionDTO.appointmentDeliveryAddress).isNull()
  }

  @Test
  fun `Maps from a session with video call`() {
    val session = deliverySessionFactory.createScheduled()
    session.appointments.first().appointmentDelivery = appointmentDeliveryFactory.create(session.appointments.first().id, appointmentDeliveryType = AppointmentDeliveryType.VIDEO_CALL)
    val sessionDTO = DeliverySessionDTO.from(session)
    assertThat(sessionDTO.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.VIDEO_CALL)
    assertThat(sessionDTO.appointmentDeliveryAddress).isNull()
  }

  @Test
  fun `Maps from a session with nps office address`() {
    val session = deliverySessionFactory.createScheduled()
    session.appointments.first().appointmentDelivery = appointmentDeliveryFactory.create(session.appointments.first().id, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE)
    val sessionDTO = DeliverySessionDTO.from(session)
    assertThat(sessionDTO.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE)
  }

  @Test
  fun `Maps from a session with non nps office address`() {
    val session = deliverySessionFactory.createScheduled()
    val appointmentDelivery = appointmentDeliveryFactory.create(appointmentId = session.appointments.first().id, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER)
    val appointmentDeliveryAddress = appointmentDeliveryAddressFactory.create(appointmentDeliveryId = appointmentDelivery.appointmentId)
    appointmentDelivery.appointmentDeliveryAddress = appointmentDeliveryAddress
    session.appointments.first().appointmentDelivery = appointmentDelivery
    val sessionDTO = DeliverySessionDTO.from(session)
    assertThat(sessionDTO.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.IN_PERSON_MEETING_OTHER)
    assertThat(sessionDTO.appointmentDeliveryAddress?.firstAddressLine).isEqualTo("Harmony Living Office, Room 4")
    assertThat(sessionDTO.appointmentDeliveryAddress?.secondAddressLine).isEqualTo("44 Bouverie Road")
    assertThat(sessionDTO.appointmentDeliveryAddress?.townOrCity).isEqualTo("Blackpool")
    assertThat(sessionDTO.appointmentDeliveryAddress?.county).isEqualTo("Lancashire")
    assertThat(sessionDTO.appointmentDeliveryAddress?.postCode).isEqualTo("SY40RE")
  }

  @Test
  fun `Maps from a session with non nps office address and second line is empty`() {
    val session = deliverySessionFactory.createScheduled()
    val appointmentDelivery = appointmentDeliveryFactory.create(appointmentId = session.appointments.first().id, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER)
    val appointmentDeliveryAddress = appointmentDeliveryAddressFactory.create(appointmentDeliveryId = appointmentDelivery.appointmentId, secondAddressLine = null, townCity = null, county = null, postCode = "SY4 0RE")
    appointmentDelivery.appointmentDeliveryAddress = appointmentDeliveryAddress
    session.appointments.first().appointmentDelivery = appointmentDelivery
    val sessionDTO = DeliverySessionDTO.from(session)
    assertThat(sessionDTO.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.IN_PERSON_MEETING_OTHER)

    assertThat(sessionDTO.appointmentDeliveryAddress?.firstAddressLine).isEqualTo("Harmony Living Office, Room 4")
    assertThat(sessionDTO.appointmentDeliveryAddress?.secondAddressLine).isEqualTo("")
    assertThat(sessionDTO.appointmentDeliveryAddress?.townOrCity).isNull()
    assertThat(sessionDTO.appointmentDeliveryAddress?.county).isNull()
    assertThat(sessionDTO.appointmentDeliveryAddress?.postCode).isEqualTo("SY40RE")
  }

  @Test
  fun `post codes are normalized`() {
    val addressDTO = AddressDTO("firstline", "secondLine", "town", "county", "  a9   9aa  ")
    assertThat(addressDTO.postCode).isEqualTo("A99AA")
  }
}
