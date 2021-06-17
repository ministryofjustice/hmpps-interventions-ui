package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryAddressRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.EndOfServiceReportRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanSessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import java.time.OffsetDateTime
import java.util.UUID

@RepositoryTest
class ActionPlanSessionsServiceRespositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  val interventionRepository: InterventionRepository,
  val actionPlanSessionRepository: ActionPlanSessionRepository,
  val actionPlanRepository: ActionPlanRepository,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
  val appointmentRepository: AppointmentRepository,
  val appointmentDeliveryRepository: AppointmentDeliveryRepository,
  val appointmentDeliveryAddressRepository: AppointmentDeliveryAddressRepository,
) {

  private val userFactory = AuthUserFactory(entityManager)
  private val actionPlanFactory = ActionPlanFactory(entityManager)
  private val actionPlanSessionFactory = ActionPlanSessionFactory(entityManager)

  private val appointmentEventPublisher: AppointmentEventPublisher = mock()
  private val communityAPIBookingService: CommunityAPIBookingService = mock()

  private val actionPlanSessionsService = ActionPlanSessionsService(
    actionPlanSessionRepository,
    actionPlanRepository,
    authUserRepository,
    appointmentEventPublisher,
    communityAPIBookingService,
    appointmentRepository,
    appointmentDeliveryRepository,
    appointmentDeliveryAddressRepository,
  )

  @BeforeEach
  fun beforeEach() {
  }

  @Nested
  inner class UpdateSessionAppointment {

    @Nested
    inner class AppointmentDelivery {

      private fun callUpdateSessionAppointment(actionPlanId: UUID, appointmentDeliveryType: AppointmentDeliveryType, appointmentDeliveryAddressLines: List<String>?): ActionPlanSession {
        return actionPlanSessionsService.updateSessionAppointment(
          actionPlanId = actionPlanId,
          sessionNumber = 1,
          appointmentTime = OffsetDateTime.now(),
          durationInMinutes = 1,
          updatedBy = userFactory.create(),
          appointmentDeliveryType = appointmentDeliveryType,
          appointmentDeliveryAddressLines = appointmentDeliveryAddressLines,
        )
      }
      @Test
      fun `can update existing appointment with a phone call delivery`() {
        val actionPlanSession = actionPlanSessionFactory.createScheduled()
        testSettingPhoneCall(actionPlanSession)
      }

      @Test
      fun `can create new appointment with a phone call delivery`() {
        val actionPlanSession = actionPlanSessionFactory.createUnscheduled()
        testSettingPhoneCall(actionPlanSession)
      }

      private fun testSettingPhoneCall(actionPlanSession: ActionPlanSession) {
        callUpdateSessionAppointment(actionPlanSession.actionPlan.id, AppointmentDeliveryType.PHONE_CALL, null)
        var updatedSession = actionPlanSessionRepository.findById(actionPlanSession.id).get()
        assertThat(updatedSession.appointments).hasSize(1)
        assertThat(updatedSession.appointments.first().appointmentDelivery).isNotNull()
        assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.PHONE_CALL)
      }

      @Test
      fun `can update existing appointment a video call delivery`() {
        val actionPlanSession = actionPlanSessionFactory.createScheduled()
        testSettingVideoCall(actionPlanSession)
      }

      @Test
      fun `can create new appointment with a video call delivery`() {
        val actionPlanSession = actionPlanSessionFactory.createUnscheduled()
        testSettingVideoCall(actionPlanSession)
      }

      private fun testSettingVideoCall(actionPlanSession: ActionPlanSession) {
        callUpdateSessionAppointment(actionPlanSession.actionPlan.id, AppointmentDeliveryType.VIDEO_CALL, null)
        var updatedSession = actionPlanSessionRepository.findById(actionPlanSession.id).get()
        assertThat(updatedSession.appointments).hasSize(1)
        assertThat(updatedSession.appointments.first().appointmentDelivery).isNotNull()
        assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.VIDEO_CALL)
      }
      @Test
      fun `can update existing appointment with an nps office code`() {
        val actionPlanSession = actionPlanSessionFactory.createScheduled()
        testSettingNPSOffice(actionPlanSession)
      }

      @Test
      fun `can create new appointment with with an nps office code`() {
        val actionPlanSession = actionPlanSessionFactory.createUnscheduled()
        testSettingNPSOffice(actionPlanSession)
      }

      private fun testSettingNPSOffice(actionPlanSession: ActionPlanSession) {
        callUpdateSessionAppointment(actionPlanSession.actionPlan.id, AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE, listOf("ABC"))
        var updatedSession = actionPlanSessionRepository.findById(actionPlanSession.id).get()
        assertThat(updatedSession.appointments).hasSize(1)
        assertThat(updatedSession.appointments.first().appointmentDelivery).isNotNull()
        assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE)
        assertThat(updatedSession.appointments.first().appointmentDelivery?.npsOfficeCode).isEqualTo("ABC")
      }

      @Nested
      inner class WithAppointmentDeliveryAddress {

        @Test
        fun `can update existing appointment with a non nps office delivery address`() {
          val actionPlanSession = actionPlanSessionFactory.createScheduled()
          testSettingNonNPSOffice(actionPlanSession)
        }

        @Test
        fun `can create new appointment with with a non nps office delivery address`() {
          val actionPlanSession = actionPlanSessionFactory.createUnscheduled()
          testSettingNonNPSOffice(actionPlanSession)
        }

        private fun testSettingNonNPSOffice(actionPlanSession: ActionPlanSession) {
          callUpdateSessionAppointment(actionPlanSession.actionPlan.id, AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, listOf("A", "B", "C", "D", "E"))
          var updatedSession = actionPlanSessionRepository.findById(actionPlanSession.id).get()
          assertThat(updatedSession.appointments).hasSize(1)
          assertThat(updatedSession.appointments.first().appointmentDelivery).isNotNull()
          assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryType).isEqualTo(AppointmentDeliveryType.IN_PERSON_MEETING_OTHER)
          assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryAddress).isNotNull()
          assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryAddress?.firstAddressLine).isEqualTo("A")
          assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryAddress?.secondAddressLine).isEqualTo("B")
          assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryAddress?.townCity).isEqualTo("C")
          assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryAddress?.county).isEqualTo("D")
          assertThat(updatedSession.appointments.first().appointmentDelivery?.appointmentDeliveryAddress?.postCode).isEqualTo("E")
        }
      }
    }
  }
}
