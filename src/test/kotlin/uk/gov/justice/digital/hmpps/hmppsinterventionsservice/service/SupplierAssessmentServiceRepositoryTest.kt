package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.anyOrNull
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.SupplierAssessmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.SupplierAssessmentFactory
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

@RepositoryTest
class SupplierAssessmentServiceRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val supplierAssessmentRepository: SupplierAssessmentRepository,
  val referralRepository: ReferralRepository,
) {

  private val appointmentService = mock<AppointmentService>()

  private val supplierAssessmentService = SupplierAssessmentService(
    supplierAssessmentRepository, referralRepository, appointmentService

  )

  private val supplierAssessmentFactory = SupplierAssessmentFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)
  private val appointmentFactory = AppointmentFactory(entityManager)
  private val userFactory = AuthUserFactory(entityManager)

  val defaultDuration = 1
  val defaultAppointmentTime = OffsetDateTime.now()

  lateinit var defaultUser: AuthUser

  @BeforeEach
  fun beforeEach() {
    defaultUser = userFactory.create()
  }

  @Nested
  inner class ScheduleNewSupplierAssessment {

    @Test
    fun `can schedule new supplier assessment appointment with no supplier assessment`() {
      val referral = referralFactory.createSent()
      val appointment = appointmentFactory.create()
      whenever(
        appointmentService.scheduleNewAppointment(
          eq(referral.id),
          eq(AppointmentType.SUPPLIER_ASSESSMENT),
          eq(defaultDuration),
          eq(defaultAppointmentTime),
          eq(defaultUser),
          eq(AppointmentDeliveryType.PHONE_CALL),
          eq(AppointmentSessionType.ONE_TO_ONE),
          anyOrNull(),
          anyOrNull()
        )
      ).thenReturn(appointment)

      val actualAppointment = supplierAssessmentService.scheduleNewSupplierAssessmentAppointment(
        referral.id,
        defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL
      )

      assertThat(actualAppointment).isEqualTo(appointment)
    }

    @Test
    fun `can schedule new supplier assessment appointment with existing appointment on supplier assessment`() {
      val existingAppointment = appointmentFactory.create(appointmentTime = OffsetDateTime.now().minusDays(1), appointmentFeedbackSubmittedAt = OffsetDateTime.now())
      val referral = existingAppointment.referral
      supplierAssessmentFactory.createWithMultipleAppointments(referral = referral, appointments = mutableSetOf(existingAppointment))
      val newAppointment = appointmentFactory.create()
      whenever(
        appointmentService.scheduleNewAppointment(
          eq(referral.id),
          eq(AppointmentType.SUPPLIER_ASSESSMENT),
          eq(defaultDuration),
          eq(defaultAppointmentTime),
          eq(defaultUser),
          eq(AppointmentDeliveryType.PHONE_CALL),
          eq(AppointmentSessionType.ONE_TO_ONE),
          anyOrNull(),
          anyOrNull()
        )
      ).thenReturn(newAppointment)

      val actualAppointment = supplierAssessmentService.scheduleNewSupplierAssessmentAppointment(
        referral.id,
        defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL
      )

      assertThat(actualAppointment).isEqualTo(newAppointment)
    }

    @Test
    fun `expect failure if sent referral does not exist`() {
      val referralId = UUID.randomUUID()

      val error = assertThrows<EntityNotFoundException> {
        supplierAssessmentService.scheduleNewSupplierAssessmentAppointment(
          referralId,
          defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL
        )
      }
      assertThat(error.message).contains("Sent Referral not found")
    }

    @Test
    fun `expect failure if current supplier assessment appointment is later`() {
      val existingAppointment = appointmentFactory.create(appointmentTime = OffsetDateTime.now().plusMonths(1), appointmentFeedbackSubmittedAt = OffsetDateTime.now())
      val referral = existingAppointment.referral
      val supplierAssessment = supplierAssessmentFactory.createWithMultipleAppointments(referral = referral, appointments = mutableSetOf(existingAppointment))
      referral.supplierAssessment = supplierAssessment
      entityManager.refresh(referral)

      val error = assertThrows<EntityExistsException> {
        supplierAssessmentService.scheduleNewSupplierAssessmentAppointment(
          referral.id,
          defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL
        )
      }
      assertThat(error.message).contains("can't schedule new supplier assessment appointment; new appointment occurs before previously scheduled appointment")
    }

    @Test
    fun `expect failure if current supplier assessment appointment has no feedback`() {
      val existingAppointment = appointmentFactory.create(appointmentTime = OffsetDateTime.now().minusDays(1), appointmentFeedbackSubmittedAt = null)
      val referral = existingAppointment.referral
      val supplierAssessment = supplierAssessmentFactory.createWithMultipleAppointments(referral = referral, appointments = mutableSetOf(existingAppointment))
      referral.supplierAssessment = supplierAssessment
      entityManager.refresh(referral)

      val error = assertThrows<ValidationError> {
        supplierAssessmentService.scheduleNewSupplierAssessmentAppointment(
          referral.id,
          defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL
        )
      }
      assertThat(error.message).contains("can't schedule new supplier assessment appointment; latest appointment has no feedback delivered")
    }
  }

  @Nested
  inner class RescheduleSupplierAssessmentAppointment {

    @Test
    fun `can reschedule an existing supplier assessment appointment`() {
      val referral = referralFactory.createSent()
      val appointment = appointmentFactory.create(referral = referral, appointmentTime = OffsetDateTime.now(), appointmentFeedbackSubmittedAt = null)
      val supplierAssessment = supplierAssessmentFactory.createWithMultipleAppointments(referral = referral, appointments = mutableSetOf(appointment))
      referral.supplierAssessment = supplierAssessment
      entityManager.refresh(referral)

      whenever(
        appointmentService.rescheduleExistingAppointment(
          eq(appointment.id),
          eq(AppointmentType.SUPPLIER_ASSESSMENT),
          eq(defaultDuration),
          eq(defaultAppointmentTime),
          eq(AppointmentDeliveryType.PHONE_CALL),
          eq(AppointmentSessionType.ONE_TO_ONE),
          anyOrNull(),
          anyOrNull()
        )
      ).thenReturn(appointment)

      val actualAppointment = supplierAssessmentService.rescheduleSupplierAssessmentAppointment(
        referral.id,
        appointment.id,
        defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE
      )

      assertThat(actualAppointment).isEqualTo(appointment)
    }

    @Test
    fun `expect failure if GROUP Session Type provided`() {
      val error = assertThrows<ValidationError> {
        supplierAssessmentService.rescheduleSupplierAssessmentAppointment(
          UUID.randomUUID(), UUID.randomUUID(),
          defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.GROUP
        )
      }
      assertThat(error.message).contains("Supplier Assessment Appointment must always be ONE_TO_ONE session")
    }

    @Test
    fun `expect failure if sent referral does not exist`() {
      val referralId = UUID.randomUUID()

      val error = assertThrows<EntityNotFoundException> {
        supplierAssessmentService.rescheduleSupplierAssessmentAppointment(
          referralId, UUID.randomUUID(),
          defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE
        )
      }
      assertThat(error.message).contains("Sent Referral not found")
    }

    @Test
    fun `expect failure if no supplier assessment exists`() {
      val referral = referralFactory.createSent()

      val error = assertThrows<EntityNotFoundException> {
        supplierAssessmentService.rescheduleSupplierAssessmentAppointment(
          referral.id, UUID.randomUUID(),
          defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE
        )
      }
      assertThat(error.message).contains("Supplier Assessment not found for referral")
    }

    @Test
    fun `expect failure if no supplier assessment appointment exists`() {
      val referral = referralFactory.createSent()
      val supplierAssessment = supplierAssessmentFactory.createWithNoAppointment(referral = referral)
      referral.supplierAssessment = supplierAssessment
      entityManager.refresh(referral)

      val error = assertThrows<EntityNotFoundException> {
        supplierAssessmentService.rescheduleSupplierAssessmentAppointment(
          referral.id, UUID.randomUUID(),
          defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE
        )
      }
      assertThat(error.message).contains("Supplier Assessment Appointment not found")
    }

    @Test
    fun `expect failure if no provided appointment id is not the latest appointment for supplier assessment`() {
      val referral = referralFactory.createSent()
      val existingAppointment = appointmentFactory.create(referral = referral, appointmentTime = OffsetDateTime.now(), appointmentFeedbackSubmittedAt = null)
      val supplierAssessment = supplierAssessmentFactory.createWithMultipleAppointments(referral = referral, appointments = mutableSetOf(existingAppointment))
      referral.supplierAssessment = supplierAssessment
      entityManager.refresh(referral)

      val error = assertThrows<ValidationError> {
        supplierAssessmentService.rescheduleSupplierAssessmentAppointment(
          referral.id, UUID.randomUUID(),
          defaultDuration, defaultAppointmentTime, defaultUser, AppointmentDeliveryType.PHONE_CALL, AppointmentSessionType.ONE_TO_ONE
        )
      }
      assertThat(error.message).contains("Supplier Assessment Appointment is not the latest")
    }
  }
}
