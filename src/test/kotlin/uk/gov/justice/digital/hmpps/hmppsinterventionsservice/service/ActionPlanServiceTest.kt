package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.same
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.mockito.AdditionalAnswers
import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.ActionPlanValidator
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanActivity
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DeliverySession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DeliverySessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.Optional.empty
import java.util.Optional.of
import java.util.UUID
import javax.persistence.EntityNotFoundException

internal class ActionPlanServiceTest {

  private val authUserRepository: AuthUserRepository = mock()
  private val referralRepository: ReferralRepository = mock()
  private val actionPlanRepository: ActionPlanRepository = mock()
  private val actionPlanValidator: ActionPlanValidator = mock()
  private val actionPlanEventPublisher: ActionPlanEventPublisher = mock()
  private val deliverySessionService: DeliverySessionService = mock()
  private val desiredOutcomeRepository: DesiredOutcomeRepository = mock()
  private val deliverySessionRepository: DeliverySessionRepository = mock()

  private val referralFactory = ReferralFactory()
  private val actionPlanFactory = ActionPlanFactory()
  private val appointmentFactory = AppointmentFactory()
  private val deliverySessionFactory = DeliverySessionFactory()

  private val actionPlanService = ActionPlanService(
    authUserRepository,
    referralRepository,
    actionPlanRepository,
    actionPlanValidator,
    actionPlanEventPublisher,
    deliverySessionService,
    deliverySessionRepository,
  )

  @Test
  fun `builds and saves an action plan for a referral`() {
    val referralId = UUID.randomUUID()
    val numberOfSessions = 5
    val authUser = AuthUser("CRN123", "auth", "user")
    val activities = listOf(ActionPlanActivity("description", OffsetDateTime.now()))
    val referral = SampleData.sampleReferral("CRN123", "Service Provider")

    whenever(authUserRepository.save(authUser)).thenReturn(authUser)
    whenever(referralRepository.getById(referralId)).thenReturn(referral)
    whenever(
      actionPlanRepository.save(
        ArgumentMatchers.argThat {
          it.numberOfSessions == numberOfSessions &&
            it.activities.size == activities.size &&
            it.activities.first() == activities.first() &&
            it.createdBy == authUser &&
            it.submittedAt == null &&
            it.submittedBy == null &&
            it.referral == referral
        }
      )
    ).thenReturn(SampleData.sampleActionPlan())

    val draftActionPlan = actionPlanService.createDraftActionPlan(referralId, numberOfSessions, activities, authUser)

    assertThat(draftActionPlan).isNotNull

    val argumentCaptor = argumentCaptor<ActionPlan>()
    verify(actionPlanValidator).validateDraftActionPlanUpdate(argumentCaptor.capture())
    val validatedDraftActionPlan = argumentCaptor.firstValue
    assertThat(validatedDraftActionPlan.numberOfSessions).isEqualTo(numberOfSessions)
    assertThat(validatedDraftActionPlan.activities.size).isEqualTo(activities.size)
    assertThat(validatedDraftActionPlan.createdAt).isNotNull
    assertThat(validatedDraftActionPlan.createdBy).isEqualTo(authUser)
    assertThat(validatedDraftActionPlan.submittedAt).isNull()
    assertThat(validatedDraftActionPlan.submittedBy).isNull()
    assertThat(validatedDraftActionPlan.referral).isEqualTo(referral)
  }

  @Test
  fun `gets action plan using action plan id`() {
    val actionPlanId = UUID.randomUUID()
    val draftActionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(actionPlanId)).thenReturn(draftActionPlan)

    val draftActionPlanResponse = actionPlanService.getDraftActionPlan(actionPlanId)

    assertThat(draftActionPlanResponse).isSameAs(draftActionPlan)
  }

  @Test
  fun `get action plan using action plan id not found`() {
    val actionPlanId = UUID.randomUUID()
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(actionPlanId)).thenReturn(null)

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      actionPlanService.getDraftActionPlan(actionPlanId)
    }
    assertThat(exception.message).isEqualTo("draft action plan not found [id=$actionPlanId]")
  }

  @Test
  fun `successful update action plan with number of sessions`() {
    val draftActionPlanId = UUID.randomUUID()
    val draftActionPlan = SampleData.sampleActionPlan(id = draftActionPlanId, numberOfSessions = 9)
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(draftActionPlanId)).thenReturn(draftActionPlan)

    val updatedDraftActionPlan = draftActionPlan.copy(numberOfSessions = 5)
    whenever(
      actionPlanRepository.save(
        ArgumentMatchers.argThat { (
          numberOfSessionsArg, activitiesArg, _, _, _, _, _, _
        ) ->
          (
            numberOfSessionsArg == 5 && activitiesArg.size == draftActionPlan.activities.size
            )
        }
      )
    ).thenReturn(updatedDraftActionPlan)

    val updatedDraftActionPlanResponse = actionPlanService.updateActionPlan(draftActionPlanId, 5, null)

    assertThat(updatedDraftActionPlanResponse).isSameAs(updatedDraftActionPlan)
    assertThat(updatedDraftActionPlanResponse.numberOfSessions).isEqualTo(5)
    verify(actionPlanValidator).validateDraftActionPlanUpdate(any())
  }

  @Test
  fun `successful update action plan with new activity`() {
    val draftActionPlanId = UUID.randomUUID()
    val draftActionPlan = SampleData.sampleActionPlan(id = draftActionPlanId, numberOfSessions = 9, activities = listOf())
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(draftActionPlanId)).thenReturn(draftActionPlan)

    val updatedDraftActionPlan = draftActionPlan.copy()

    whenever(
      actionPlanRepository.save(
        ArgumentMatchers.argThat { (
          numberOfSessionsArg, activitiesArg, _, _, _, _, _, _
        ) ->
          (
            numberOfSessionsArg == 9 && activitiesArg.size == 1
            )
        }
      )
    ).thenReturn(updatedDraftActionPlan)

    val newActivity = ActionPlanActivity("Description", OffsetDateTime.now())

    val updatedDraftActionPlanResponse = actionPlanService.updateActionPlan(draftActionPlanId, null, newActivity)

    assertThat(updatedDraftActionPlanResponse).isSameAs(updatedDraftActionPlan)
    assertThat(updatedDraftActionPlanResponse.numberOfSessions).isEqualTo(9)
    assertThat(updatedDraftActionPlanResponse.activities).contains(newActivity)
  }

  @Test
  fun `get action plan using id`() {
    val actionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId)
    whenever(actionPlanRepository.findById(actionPlanId)).thenReturn(of(actionPlan))

    assertThat(actionPlanService.getActionPlan(actionPlanId)).isSameAs(actionPlan)
  }

  @Test
  fun `get action plan throws exception when not found`() {
    val actionPlanId = UUID.randomUUID()
    whenever(actionPlanRepository.findById(actionPlanId)).thenReturn(empty())

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      actionPlanService.getActionPlan(actionPlanId)
    }
    assertThat(exception.message).isEqualTo("action plan not found [id=$actionPlanId]")
  }

  @Test
  fun `submit action plan`() {
    val timeBeforeSubmit = OffsetDateTime.now()
    val actionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId, numberOfSessions = 2)
    val authUser = AuthUser("CRN123", "auth", "user")
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(actionPlanId)).thenReturn(actionPlan)
    whenever(
      actionPlanRepository.save(
        ArgumentMatchers.argThat {
          it.numberOfSessions == actionPlan.numberOfSessions &&
            it.activities.size == actionPlan.activities.size &&
            it.activities.first() == actionPlan.activities.first() &&
            it.createdAt == actionPlan.createdAt &&
            it.createdBy == actionPlan.createdBy &&
            it.submittedAt!!.isAfter(timeBeforeSubmit) &&
            it.submittedBy == authUser &&
            it.approvedAt == null &&
            it.approvedBy == null &&
            it.referral == actionPlan.referral
        }
      )
    ).thenReturn(SampleData.sampleActionPlan())
    whenever(authUserRepository.save(any())).thenReturn(SampleData.sampleAuthUser())

    val submittedActionPlan = actionPlanService.submitDraftActionPlan(actionPlanId, authUser)

    assertThat(submittedActionPlan).isNotNull
    verify(actionPlanValidator).validateSubmittedActionPlan(any())
  }

  @Test
  fun `action plan approval sets approved and creates unscheduled sessions`() {
    val actionPlanId = UUID.randomUUID()
    val actionPlan = SampleData.sampleActionPlan(id = actionPlanId, numberOfSessions = 2)
    val authUser = AuthUser("CRN123", "auth", "user")
    whenever(actionPlanRepository.findById(actionPlanId)).thenReturn(of(actionPlan))
    whenever(authUserRepository.save(any())).then(AdditionalAnswers.returnsFirstArg<AuthUser>())
    whenever(actionPlanRepository.save(any())).then(AdditionalAnswers.returnsFirstArg<ActionPlan>())

    val approvedActionPlan = actionPlanService.approveActionPlan(actionPlanId, authUser)
    assertThat(approvedActionPlan.approvedAt).isNotNull
    assertThat(approvedActionPlan.approvedBy).isEqualTo(authUser)
    verify(actionPlanEventPublisher).actionPlanApprovedEvent(same(actionPlan))
    verify(deliverySessionService).createUnscheduledSessionsForActionPlan(same(actionPlan))
  }

  @Test
  fun `submit action plan throws exception if draft plan is not used`() {
    val actionPlanId = UUID.randomUUID()
    val authUser = AuthUser("CRN123", "auth", "user")
    whenever(actionPlanRepository.findByIdAndSubmittedAtIsNull(actionPlanId)).thenReturn(null)

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      actionPlanService.submitDraftActionPlan(actionPlanId, authUser)
    }
    assertThat(exception.message).isEqualTo("draft action plan not found [id=$actionPlanId]")
  }

  @Test
  fun `get action plan using referral id`() {
    val actionPlanId = UUID.randomUUID()
    val actionPlan = actionPlanFactory.create(id = actionPlanId)
    whenever(actionPlanRepository.findAllByReferralIdAndApprovedAtIsNotNull(actionPlan.referral.id)).thenReturn(listOf(actionPlan))

    assertThat(actionPlanService.getApprovedActionPlansByReferral(actionPlan.referral.id)).isEqualTo(listOf(actionPlan))
  }

  @Test
  fun `update action plan activity`() {
    val activity1 = SampleData.sampleActionPlanActivity()
    val activity2 = SampleData.sampleActionPlanActivity()
    val actionPlan = SampleData.sampleActionPlan(activities = listOf(activity1, activity2))
    val updatedDescription = "updated description"
    val argument: ArgumentCaptor<ActionPlan> = ArgumentCaptor.forClass(ActionPlan::class.java)

    whenever(actionPlanRepository.findById(actionPlan.id)).thenReturn(of(actionPlan))
    whenever(actionPlanRepository.save(any())).thenReturn(actionPlan)

    actionPlanService.updateActionPlanActivity(actionPlan.id, activity1.id, updatedDescription)

    verify(actionPlanRepository).save(argument.capture())
    val savedActionPlan = argument.value
    assertThat(savedActionPlan.activities[0].description == updatedDescription)
    assertThat(
      savedActionPlan.activities[1].description == SampleData.sampleActionPlanActivity().description
    )
  }

  @Test
  fun `getAllAttendedAppointments gets appointments from all sessions`() {
    val referral = referralFactory.createSent()

    val actionPlan = actionPlanFactory.createApproved(referral = referral)
    referral.actionPlans = mutableListOf(actionPlan)

    // then make a bunch of appointments
    val unattendedAppointments = (1..5).map {
      appointmentFactory.create(referral = referral)
    }
    val attendedAppointments = (1..5).map {
      appointmentFactory.create(referral = referral, attended = Attended.YES, appointmentFeedbackSubmittedAt = OffsetDateTime.now())
    }
    val lateAppointments = (1..5).map {
      appointmentFactory.create(referral = referral, attended = Attended.LATE, appointmentFeedbackSubmittedAt = OffsetDateTime.now())
    }

    // now we'll make a bunch of sessions with various unattended and attended appointments on them
    val session1 = DeliverySession(
      appointments = mutableSetOf(
        unattendedAppointments[0],
        unattendedAppointments[1],
        lateAppointments[0]
      ),
      1, referral, UUID.randomUUID()
    )

    val session2 = DeliverySession(
      appointments = mutableSetOf(unattendedAppointments[2], attendedAppointments[0]),
      2,
      referral,
      UUID.randomUUID(),
    )

    val session3 = DeliverySession(
      appointments = mutableSetOf(
        unattendedAppointments[3],
        unattendedAppointments[4],
        lateAppointments[1]
      ),
      3, referral, UUID.randomUUID(),
    )

    whenever(deliverySessionRepository.findAllByReferralId(referral.id)).thenReturn(listOf(session1, session2, session3))
    assertThat(actionPlanService.getAllAttendedAppointments(actionPlan)).hasSameElementsAs(listOf(lateAppointments[0], lateAppointments[1], attendedAppointments[0]))
  }

  @Test
  fun `getAllAttendedAppointments returns empty list when actionPlan has no sessions`() {
    val actionPlan = actionPlanFactory.createSubmitted()
    assertThat(actionPlanService.getAllAttendedAppointments(actionPlan)).isEqualTo(emptyList<Appointment>())
  }

  @Test
  fun `getFirstAttendedAppointment returns the appointment with the earliest time`() {
    val referral = referralFactory.createSent()
    val actionPlan = actionPlanFactory.createApproved(referral = referral)
    referral.actionPlans = mutableListOf(actionPlan)

    val first = appointmentFactory.create(referral = referral, appointmentTime = OffsetDateTime.now().minusHours(2), attended = Attended.LATE, appointmentFeedbackSubmittedAt = OffsetDateTime.now())
    val second = appointmentFactory.create(referral = referral, appointmentTime = OffsetDateTime.now().minusHours(1), attended = Attended.YES, appointmentFeedbackSubmittedAt = OffsetDateTime.now())

    val session1 = DeliverySession(appointments = mutableSetOf(first), 1, referral, UUID.randomUUID())
    val session2 = DeliverySession(appointments = mutableSetOf(second), 2, referral, UUID.randomUUID())

    whenever(deliverySessionRepository.findAllByReferralId(referral.id)).thenReturn(listOf(session1, session2))
    assertThat(actionPlanService.getFirstAttendedAppointment(actionPlan)).isEqualTo(first)
  }

  @Test
  fun `getFirstAttendedAppointment returns null when there are no attended appointments`() {
    val referral = referralFactory.createSent()
    val actionPlan = actionPlanFactory.createApproved(referral = referral)
    whenever(deliverySessionRepository.findAllByReferralId(referral.id)).thenReturn(emptyList())
    assertThat(actionPlanService.getFirstAttendedAppointment(actionPlan)).isNull()

    val session1 = DeliverySession(appointments = mutableSetOf(appointmentFactory.create(referral = referral, appointmentTime = OffsetDateTime.now().minusHours(2), attended = Attended.NO, appointmentFeedbackSubmittedAt = OffsetDateTime.now())), 1, referral, UUID.randomUUID())
    val session2 = DeliverySession(appointments = mutableSetOf(appointmentFactory.create(referral = referral, appointmentTime = OffsetDateTime.now().minusHours(1), attended = Attended.NO, appointmentFeedbackSubmittedAt = OffsetDateTime.now())), 2, referral, UUID.randomUUID())

    whenever(deliverySessionRepository.findAllByReferralId(actionPlan.id)).thenReturn(listOf(session1, session2))
    assertThat(actionPlanService.getFirstAttendedAppointment(actionPlan)).isNull()
  }
}
