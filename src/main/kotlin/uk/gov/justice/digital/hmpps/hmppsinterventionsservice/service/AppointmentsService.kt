package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanAppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

@Service
class AppointmentsService(
  val actionPlanAppointmentRepository: ActionPlanAppointmentRepository,
  val actionPlanRepository: ActionPlanRepository,
  val authUserRepository: AuthUserRepository,
  val appointmentEventPublisher: AppointmentEventPublisher,
  val communityAPIBookingService: CommunityAPIBookingService,
) {
  fun createAppointment(
    actionPlan: ActionPlan,
    sessionNumber: Int,
    appointmentTime: OffsetDateTime?,
    durationInMinutes: Int?,
    createdByUser: AuthUser,
  ): ActionPlanAppointment {
    val actionPlanId = actionPlan.id
    checkAppointmentSessionIsNotDuplicate(actionPlanId, sessionNumber)

    val appointment = ActionPlanAppointment(
      id = UUID.randomUUID(),
      sessionNumber = sessionNumber,
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now(),
      actionPlan = actionPlan,
    )

    return actionPlanAppointmentRepository.save(appointment)
  }

  fun createUnscheduledAppointmentsForActionPlan(submittedActionPlan: ActionPlan, actionPlanSubmitter: AuthUser) {
    val numberOfSessions = submittedActionPlan.numberOfSessions!!
    for (i in 1..numberOfSessions) {
      createAppointment(submittedActionPlan, i, null, null, actionPlanSubmitter)
    }
  }

  fun updateAppointment(
    actionPlanId: UUID,
    sessionNumber: Int,
    appointmentTime: OffsetDateTime?,
    durationInMinutes: Int?
  ): ActionPlanAppointment {

    val appointment = getActionPlanAppointmentOrThrowException(actionPlanId, sessionNumber)
    communityAPIBookingService.book(appointment, appointmentTime, durationInMinutes)

    mergeAppointment(appointment, appointmentTime, durationInMinutes)
    return actionPlanAppointmentRepository.save(appointment)
  }

  fun recordAttendance(
    actionPlanId: UUID,
    sessionNumber: Int,
    attended: Attended,
    additionalInformation: String?
  ): ActionPlanAppointment {
    val appointment = getActionPlanAppointmentOrThrowException(actionPlanId, sessionNumber)
    setAttendanceFields(appointment, attended, additionalInformation)
    appointmentEventPublisher.attendanceRecordedEvent(appointment, attended == Attended.NO)
    return actionPlanAppointmentRepository.save(appointment)
  }

  fun recordBehaviour(
    actionPlanId: UUID,
    sessionNumber: Int,
    behaviourDescription: String,
    notifyProbationPractitioner: Boolean,
  ): ActionPlanAppointment {
    val appointment = getActionPlanAppointmentOrThrowException(actionPlanId, sessionNumber)
    setBehaviourFields(appointment, behaviourDescription, notifyProbationPractitioner)
    appointmentEventPublisher.behaviourRecordedEvent(appointment, notifyProbationPractitioner)
    return actionPlanAppointmentRepository.save(appointment)
  }

  fun getAppointments(actionPlanId: UUID): List<ActionPlanAppointment> {
    return actionPlanAppointmentRepository.findAllByActionPlanId(actionPlanId)
  }

  fun getAppointment(actionPlanId: UUID, sessionNumber: Int): ActionPlanAppointment {
    return getActionPlanAppointmentOrThrowException(actionPlanId, sessionNumber)
  }

  private fun setAttendanceFields(
    appointment: ActionPlanAppointment,
    attended: Attended,
    additionalInformation: String?
  ) {
    appointment.attended = attended
    additionalInformation?.let { appointment.additionalAttendanceInformation = additionalInformation }
    appointment.attendanceSubmittedAt = OffsetDateTime.now()
  }

  private fun setBehaviourFields(
    appointment: ActionPlanAppointment,
    behaviour: String,
    notifyProbationPractitioner: Boolean,
  ) {
    appointment.attendanceBehaviour = behaviour
    appointment.attendanceBehaviourSubmittedAt = OffsetDateTime.now()
    appointment.notifyPPOfAttendanceBehaviour = notifyProbationPractitioner
  }

  private fun checkAppointmentSessionIsNotDuplicate(actionPlanId: UUID, sessionNumber: Int) {
    getActionPlanAppointment(actionPlanId, sessionNumber)?.let {
      throw EntityExistsException("Action plan appointment already exists for [id=$actionPlanId, sessionNumber=$sessionNumber]")
    }
  }

  private fun getActionPlanAppointmentOrThrowException(actionPlanId: UUID, sessionNumber: Int): ActionPlanAppointment =

    getActionPlanAppointment(actionPlanId, sessionNumber)
      ?: throw EntityNotFoundException("Action plan appointment not found [id=$actionPlanId, sessionNumber=$sessionNumber]")

  private fun getActionPlanAppointment(actionPlanId: UUID, sessionNumber: Int) =
    actionPlanAppointmentRepository.findByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)

  private fun mergeAppointment(
    appointment: ActionPlanAppointment,
    appointmentTime: OffsetDateTime?,
    durationInMinutes: Int?
  ) {
    appointmentTime?.let { appointment.appointmentTime = it }
    durationInMinutes?.let { appointment.durationInMinutes = it }
  }
}
