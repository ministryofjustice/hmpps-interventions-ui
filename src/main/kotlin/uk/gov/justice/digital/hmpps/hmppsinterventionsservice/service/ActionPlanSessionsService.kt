package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException
import javax.transaction.Transactional

@Service
@Transactional
class ActionPlanSessionsService(
  val actionPlanSessionRepository: ActionPlanSessionRepository,
  val actionPlanRepository: ActionPlanRepository,
  val authUserRepository: AuthUserRepository,
  val appointmentEventPublisher: AppointmentEventPublisher,
  val communityAPIBookingService: CommunityAPIBookingService,
) {
  fun createSession(
    actionPlan: ActionPlan,
    sessionNumber: Int,
    appointmentTime: OffsetDateTime?,
    durationInMinutes: Int?,
    createdByUser: AuthUser,
  ): ActionPlanSession {
    val actionPlanId = actionPlan.id
    checkSessionIsNotDuplicate(actionPlanId, sessionNumber)

    val session = ActionPlanSession(
      id = UUID.randomUUID(),
      sessionNumber = sessionNumber,
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now(),
      actionPlan = actionPlan,
    )

    return actionPlanSessionRepository.save(session)
  }

  fun createUnscheduledSessionsForActionPlan(submittedActionPlan: ActionPlan, actionPlanSubmitter: AuthUser) {
    val numberOfSessions = submittedActionPlan.numberOfSessions!!
    for (i in 1..numberOfSessions) {
      createSession(submittedActionPlan, i, null, null, actionPlanSubmitter)
    }
  }

  fun updateSession(
    actionPlanId: UUID,
    sessionNumber: Int,
    appointmentTime: OffsetDateTime?,
    durationInMinutes: Int?
  ): ActionPlanSession {

    val session = getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)
    communityAPIBookingService.book(session, appointmentTime, durationInMinutes)?.let {
      session.deliusAppointmentId = it
    }

    mergeSession(session, appointmentTime, durationInMinutes)
    return actionPlanSessionRepository.save(session)
  }

  fun recordAttendance(
    actionPlanId: UUID,
    sessionNumber: Int,
    attended: Attended,
    additionalInformation: String?
  ): ActionPlanSession {
    val session = getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)

    if (session.sessionFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    setAttendanceFields(session, attended, additionalInformation)
    return actionPlanSessionRepository.save(session)
  }

  fun recordBehaviour(
    actionPlanId: UUID,
    sessionNumber: Int,
    behaviourDescription: String,
    notifyProbationPractitioner: Boolean,
  ): ActionPlanSession {
    val session = getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)

    if (session.sessionFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    setBehaviourFields(session, behaviourDescription, notifyProbationPractitioner)
    return actionPlanSessionRepository.save(session)
  }

  fun submitSessionFeedback(actionPlanId: UUID, sessionNumber: Int): ActionPlanSession {
    val session = getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)

    if (session.sessionFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    if (session.attendanceSubmittedAt == null) {
      throw ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "can't submit session feedback unless attendance has been recorded")
    }

    session.sessionFeedbackSubmittedAt = OffsetDateTime.now()
    actionPlanSessionRepository.save(session)

    appointmentEventPublisher.attendanceRecordedEvent(session, session.attended == Attended.NO)
    appointmentEventPublisher.behaviourRecordedEvent(session, session.notifyPPOfAttendanceBehaviour!!)
    appointmentEventPublisher.sessionFeedbackRecordedEvent(session, session.notifyPPOfAttendanceBehaviour!!)
    return session
  }

  fun getSessions(actionPlanId: UUID): List<ActionPlanSession> {
    return actionPlanSessionRepository.findAllByActionPlanId(actionPlanId)
  }

  fun getSession(actionPlanId: UUID, sessionNumber: Int): ActionPlanSession {
    return getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)
  }

  private fun setAttendanceFields(
    session: ActionPlanSession,
    attended: Attended,
    additionalInformation: String?
  ) {
    session.attended = attended
    additionalInformation?.let { session.additionalAttendanceInformation = additionalInformation }
    session.attendanceSubmittedAt = OffsetDateTime.now()
  }

  private fun setBehaviourFields(
    session: ActionPlanSession,
    behaviour: String,
    notifyProbationPractitioner: Boolean,
  ) {
    session.attendanceBehaviour = behaviour
    session.attendanceBehaviourSubmittedAt = OffsetDateTime.now()
    session.notifyPPOfAttendanceBehaviour = notifyProbationPractitioner
  }

  private fun checkSessionIsNotDuplicate(actionPlanId: UUID, sessionNumber: Int) {
    getActionPlanSession(actionPlanId, sessionNumber)?.let {
      throw EntityExistsException("Action plan session already exists for [id=$actionPlanId, sessionNumber=$sessionNumber]")
    }
  }

  private fun getActionPlanSessionOrThrowException(actionPlanId: UUID, sessionNumber: Int): ActionPlanSession =

    getActionPlanSession(actionPlanId, sessionNumber)
      ?: throw EntityNotFoundException("Action plan session not found [id=$actionPlanId, sessionNumber=$sessionNumber]")

  private fun getActionPlanSession(actionPlanId: UUID, sessionNumber: Int) =
    actionPlanSessionRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)

  private fun mergeSession(
    session: ActionPlanSession,
    appointmentTime: OffsetDateTime?,
    durationInMinutes: Int?
  ) {
    appointmentTime?.let { session.appointmentTime = it }
    durationInMinutes?.let { session.durationInMinutes = it }
  }
}
