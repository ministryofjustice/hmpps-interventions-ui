package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SessionAttendance
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
) {
  fun createAppointment(
    actionPlanId: UUID,
    sessionNumber: Int,
    appointmentTime: OffsetDateTime?,
    durationInMinutes: Int?,
    createdByUser: AuthUser
  ): ActionPlanAppointment {

    checkAppointmentSessionIsNotDuplicate(actionPlanId, sessionNumber)

    val appointment = ActionPlanAppointment(
      id = UUID.randomUUID(),
      sessionNumber = sessionNumber,
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now(),
      actionPlan = actionPlanRepository.findById(actionPlanId).orElseThrow {
        throw EntityNotFoundException("action plan not found [id=$actionPlanId]")
      }
    )

    return actionPlanAppointmentRepository.save(appointment)
  }

  fun updateAppointment(
    actionPlanId: UUID,
    sessionNumber: Int,
    appointmentTime: OffsetDateTime?,
    durationInMinutes: Int?
  ): ActionPlanAppointment {

    val appointment = getActionPlanAppointmentOrThrowException(actionPlanId, sessionNumber)
    mergeAppointment(appointment, appointmentTime, durationInMinutes)
    return actionPlanAppointmentRepository.save(appointment)
  }

  fun updateAppointmentWithAttendance(
    actionPlanId: UUID,
    sessionNumber: Int,
    sessionAttendance: SessionAttendance,
    additionalInformation: String
  ): ActionPlanAppointment {
    val appointment = getActionPlanAppointmentOrThrowException(actionPlanId, sessionNumber)
    appointment.sessionAttendance = sessionAttendance
    appointment.additionalInformation = additionalInformation
    return actionPlanAppointmentRepository.save(appointment)
  }

  fun getAppointments(actionPlanId: UUID): List<ActionPlanAppointment> {

    return actionPlanAppointmentRepository.findAllByActionPlanId(actionPlanId)
  }

  fun getAppointment(actionPlanId: UUID, sessionNumber: Int): ActionPlanAppointment {

    return getActionPlanAppointmentOrThrowException(actionPlanId, sessionNumber)
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
