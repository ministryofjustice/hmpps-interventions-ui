package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
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
  val appointmentRepository: AppointmentRepository,
) {
  fun createUnscheduledSessionsForActionPlan(approvedActionPlan: ActionPlan) {
    val numberOfSessions = approvedActionPlan.numberOfSessions!!
    for (i in 1..numberOfSessions) {
      createSession(approvedActionPlan, i)
    }
  }

  private fun createSession(
    actionPlan: ActionPlan,
    sessionNumber: Int,
  ): ActionPlanSession {
    val actionPlanId = actionPlan.id
    checkSessionIsNotDuplicate(actionPlanId, sessionNumber)

    val session = ActionPlanSession(
      id = UUID.randomUUID(),
      sessionNumber = sessionNumber,
      actionPlan = actionPlan,
    )

    return actionPlanSessionRepository.save(session)
  }

  fun updateSessionAppointment(
    actionPlanId: UUID,
    sessionNumber: Int,
    appointmentTime: OffsetDateTime,
    durationInMinutes: Int,
    updatedBy: AuthUser,
  ): ActionPlanSession {
    val session = getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)
    val existingAppointment = session.currentAppointment

    val deliusAppointmentId = communityAPIBookingService.book(
      session.actionPlan.referral,
      existingAppointment,
      appointmentTime,
      durationInMinutes
    )

    if (existingAppointment == null) {
      val appointment = Appointment(
        id = UUID.randomUUID(),
        createdBy = authUserRepository.save(updatedBy),
        createdAt = OffsetDateTime.now(),
        appointmentTime = appointmentTime,
        durationInMinutes = durationInMinutes,
        deliusAppointmentId = deliusAppointmentId,
      )
      appointmentRepository.save(appointment)
      session.appointments.add(appointment)
    } else {
      existingAppointment.appointmentTime = appointmentTime
      existingAppointment.durationInMinutes = durationInMinutes
      existingAppointment.deliusAppointmentId = deliusAppointmentId
      appointmentRepository.save(existingAppointment)
    }

    return actionPlanSessionRepository.save(session)
  }

  fun recordAppointmentAttendance(
    actionPlanId: UUID,
    sessionNumber: Int,
    attended: Attended,
    additionalInformation: String?
  ): ActionPlanSession {
    val session = getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)
    val appointment = session.currentAppointment
      ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "can't record appointment attendance; no appointments have been booked for this session")

    if (appointment.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    setAttendanceFields(appointment, attended, additionalInformation)
    return actionPlanSessionRepository.save(session)
  }

  fun recordBehaviour(
    actionPlanId: UUID,
    sessionNumber: Int,
    behaviourDescription: String,
    notifyProbationPractitioner: Boolean,
  ): ActionPlanSession {
    val session = getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)
    val appointment = session.currentAppointment
      ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "can't record appointment behaviour; no appointments have been booked for this session")

    if (appointment.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    setBehaviourFields(appointment, behaviourDescription, notifyProbationPractitioner)
    appointmentRepository.save(appointment)
    return actionPlanSessionRepository.save(session)
  }

  fun submitSessionFeedback(actionPlanId: UUID, sessionNumber: Int, submitter: AuthUser): ActionPlanSession {
    val session = getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)
    val appointment = session.currentAppointment

    if (appointment?.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    if (appointment?.attendanceSubmittedAt == null) {
      throw ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "can't submit session feedback unless attendance has been recorded")
    }

    appointment.appointmentFeedbackSubmittedAt = OffsetDateTime.now()
    appointment.appointmentFeedbackSubmittedBy = authUserRepository.save(submitter)
    actionPlanSessionRepository.save(session)

    appointmentEventPublisher.attendanceRecordedEvent(session, appointment.attended!! == Attended.NO)

    if (appointment.attendanceBehaviourSubmittedAt != null) { // excluding the case of non attendance
      appointmentEventPublisher.behaviourRecordedEvent(session, appointment.notifyPPOfAttendanceBehaviour!!)
    }

    appointmentEventPublisher.sessionFeedbackRecordedEvent(session, appointment.notifyPPOfAttendanceBehaviour ?: false)
    return session
  }

  fun getSessions(actionPlanId: UUID): List<ActionPlanSession> {
    return actionPlanSessionRepository.findAllByActionPlanId(actionPlanId)
  }

  fun getSession(actionPlanId: UUID, sessionNumber: Int): ActionPlanSession {
    return getActionPlanSessionOrThrowException(actionPlanId, sessionNumber)
  }

  private fun setAttendanceFields(
    appointment: Appointment,
    attended: Attended,
    additionalInformation: String?
  ) {
    appointment.attended = attended
    additionalInformation?.let { appointment.additionalAttendanceInformation = additionalInformation }
    appointment.attendanceSubmittedAt = OffsetDateTime.now()
  }

  private fun setBehaviourFields(
    appointment: Appointment,
    behaviour: String,
    notifyProbationPractitioner: Boolean,
  ) {
    appointment.attendanceBehaviour = behaviour
    appointment.attendanceBehaviourSubmittedAt = OffsetDateTime.now()
    appointment.notifyPPOfAttendanceBehaviour = notifyProbationPractitioner
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
}
