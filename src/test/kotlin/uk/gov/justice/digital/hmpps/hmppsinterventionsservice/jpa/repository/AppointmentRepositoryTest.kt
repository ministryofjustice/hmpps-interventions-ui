package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentDeliveryAddressFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentDeliveryFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class AppointmentRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val appointmentRepository: AppointmentRepository
) {
  private val appointmentDeliveryFactory = AppointmentDeliveryFactory(entityManager)
  private val appointmentDeliveryAddressFactory = AppointmentDeliveryAddressFactory(entityManager)

  @BeforeEach
  fun setup() {
    appointmentRepository.deleteAll()
  }
  @Nested
  inner class AppointmentDelivery {
    @Test
    fun `can save phone call appointment delivery`() {
      val appointmentDelivery = appointmentDeliveryFactory.create(appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL)

      entityManager.flush()
      entityManager.clear()

      val databaseAppointment = appointmentRepository.findById(appointmentDelivery.appointmentId).get()

      Assertions.assertThat(databaseAppointment.id).isEqualTo(appointmentDelivery.appointmentId)
      Assertions.assertThat(databaseAppointment.appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.PHONE_CALL)
    }

    @Test
    fun `can save other address appointment delivery`() {
      val appointmentDeliveryAddress = appointmentDeliveryAddressFactory.create()

      entityManager.flush()
      entityManager.clear()

      val databaseAppointment = appointmentRepository.findById(appointmentDeliveryAddress.appointmentDeliveryId).get()

      Assertions.assertThat(databaseAppointment.id).isEqualTo(appointmentDeliveryAddress.appointmentDeliveryId)
      Assertions.assertThat(databaseAppointment.appointmentDelivery?.appointmentId).isEqualTo(appointmentDeliveryAddress.appointmentDeliveryId)
      Assertions.assertThat(databaseAppointment.appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.IN_PERSON_MEETING_OTHER)
      Assertions.assertThat(databaseAppointment.appointmentDelivery?.appointmentDeliveryAddress?.appointmentDeliveryId).isEqualTo(appointmentDeliveryAddress.appointmentDeliveryId)
    }
  }
}
