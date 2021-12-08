package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityNotFoundException

@RepositoryTest
class AppointmentServiceRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val appointmentRepository: AppointmentRepository,
  val appointmentDeliveryRepository: AppointmentDeliveryRepository,
  val authUserRepository: AuthUserRepository,
  val referralRepository: ReferralRepository,
) {

  private val communityAPIBookingService: CommunityAPIBookingService = mock()
  private val appointmentEventPublisher: AppointmentEventPublisher = mock()

  private val appointmentService = AppointmentService(
    appointmentRepository,
    communityAPIBookingService,
    appointmentDeliveryRepository,
    authUserRepository,
    appointmentEventPublisher,
    referralRepository,
  )

  private val userFactory = AuthUserFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)

  val defaultDuration = 1
  val defaultAppointmentTime = OffsetDateTime.now()

  lateinit var defaultUser: AuthUser

  @BeforeEach
  fun beforeEach() {
    defaultUser = userFactory.create()
  }

  @Nested
  inner class ScheduleNewAppointment {

    @Test
    fun `can schedule new appointment`() {
      val referral = referralFactory.createSent()
      val appointment = appointmentService.scheduleNewAppointment(
        referral.id,
        AppointmentType.SUPPLIER_ASSESSMENT,
        defaultDuration,
        defaultAppointmentTime,
        defaultUser,
        AppointmentDeliveryType.PHONE_CALL,
        AppointmentSessionType.ONE_TO_ONE,
      )

      Assertions.assertThat(appointment).isNotNull
    }

    @Test
    fun `expect failure when sent referral does not exist`() {
      val referralId = UUID.randomUUID()
      val error = assertThrows<EntityNotFoundException> {
        appointmentService.scheduleNewAppointment(
          referralId,
          AppointmentType.SUPPLIER_ASSESSMENT,
          defaultDuration,
          defaultAppointmentTime,
          defaultUser,
          AppointmentDeliveryType.PHONE_CALL,
          AppointmentSessionType.ONE_TO_ONE,
        )
      }
      Assertions.assertThat(error.message).contains("Sent Referral not found")
    }
  }
}
