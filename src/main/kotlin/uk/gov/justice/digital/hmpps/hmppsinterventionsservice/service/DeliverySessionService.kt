package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType.SERVICE_DELIVERY
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DeliverySession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DeliverySessionRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException
import javax.transaction.Transactional

@Service
@Transactional
class DeliverySessionService(
  val deliverySessionRepository: DeliverySessionRepository,
  val actionPlanRepository: ActionPlanRepository,
  val authUserRepository: AuthUserRepository,
  val actionPlanAppointmentEventPublisher: ActionPlanAppointmentEventPublisher,
  val communityAPIBookingService: CommunityAPIBookingService,
  val appointmentService: AppointmentService,
  val appointmentRepository: AppointmentRepository,
) {
  fun createUnscheduledSessionsForActionPlan(approvedActionPlan: ActionPlan) {
    val previouslyApprovedSessions = approvedActionPlan.referral.approvedActionPlan?. let {
      deliverySessionRepository.findAllByActionPlanId(it.id).count()
    } ?: 0

    val numberOfSessions = approvedActionPlan.numberOfSessions!!
    for (i in previouslyApprovedSessions + 1..numberOfSessions) {
      createSession(approvedActionPlan, i)
    }
  }

  private fun createSession(
    actionPlan: ActionPlan,
    sessionNumber: Int,
  ): DeliverySession {
    val actionPlanId = actionPlan.id
    checkSessionIsNotDuplicate(actionPlanId, sessionNumber)

    val session = DeliverySession(
      id = UUID.randomUUID(),
      sessionNumber = sessionNumber,
      referral = actionPlan.referral,
    )

    return deliverySessionRepository.save(session)
  }

  fun updateSessionAppointment(
    actionPlanId: UUID,
    sessionNumber: Int,
    appointmentTime: OffsetDateTime,
    durationInMinutes: Int,
    updatedBy: AuthUser,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentSessionType: AppointmentSessionType? = null,
    appointmentDeliveryAddress: AddressDTO? = null,
    npsOfficeCode: String? = null,
  ): DeliverySession {

    val session = getDeliverySessionByActionPlanIdOrThrowException(actionPlanId, sessionNumber)
    val existingAppointment = session.currentAppointment

    // TODO: Some code duplication here with AppointmentService.kt
    val deliusAppointmentId = communityAPIBookingService.book(
      session.referral,
      existingAppointment,
      appointmentTime,
      durationInMinutes,
      SERVICE_DELIVERY,
      npsOfficeCode
    )
    if (existingAppointment == null) {
      val appointment = Appointment(
        id = UUID.randomUUID(),
        createdBy = authUserRepository.save(updatedBy),
        createdAt = OffsetDateTime.now(),
        appointmentTime = appointmentTime,
        durationInMinutes = durationInMinutes,
        deliusAppointmentId = deliusAppointmentId,
        referral = session.referral,
      )
      appointmentRepository.saveAndFlush(appointment)
      appointmentService.createOrUpdateAppointmentDeliveryDetails(appointment, appointmentDeliveryType, appointmentSessionType, appointmentDeliveryAddress, npsOfficeCode)
      session.appointments.add(appointment)
    } else {
      existingAppointment.appointmentTime = appointmentTime
      existingAppointment.durationInMinutes = durationInMinutes
      existingAppointment.deliusAppointmentId = deliusAppointmentId
      appointmentRepository.saveAndFlush(existingAppointment)
      appointmentService.createOrUpdateAppointmentDeliveryDetails(existingAppointment, appointmentDeliveryType, appointmentSessionType, appointmentDeliveryAddress, npsOfficeCode)
    }
    return deliverySessionRepository.save(session)
  }

  fun recordAppointmentAttendance(
    actor: AuthUser,
    actionPlanId: UUID,
    sessionNumber: Int,
    attended: Attended,
    additionalInformation: String?
  ): DeliverySession {
    val session = getDeliverySessionByActionPlanIdOrThrowException(actionPlanId, sessionNumber)
    val appointment = session.currentAppointment
      ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "can't record appointment attendance; no appointments have been booked for this session")

    if (appointment.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    setAttendanceFields(appointment, attended, additionalInformation, actor)
    return deliverySessionRepository.save(session)
  }

  fun recordBehaviour(
    actor: AuthUser,
    actionPlanId: UUID,
    sessionNumber: Int,
    behaviourDescription: String,
    notifyProbationPractitioner: Boolean,
  ): DeliverySession {
    val session = getDeliverySessionByActionPlanIdOrThrowException(actionPlanId, sessionNumber)
    val appointment = session.currentAppointment
      ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "can't record appointment behaviour; no appointments have been booked for this session")

    if (appointment.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    setBehaviourFields(appointment, behaviourDescription, notifyProbationPractitioner, actor)
    appointmentRepository.save(appointment)
    return deliverySessionRepository.save(session)
  }

  fun submitSessionFeedback(actionPlanId: UUID, sessionNumber: Int, submitter: AuthUser): DeliverySession {
    val session = getDeliverySessionByActionPlanIdOrThrowException(actionPlanId, sessionNumber)
    val appointment = session.currentAppointment

    if (appointment?.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "session feedback has already been submitted for this session")
    }

    if (appointment?.attendanceSubmittedAt == null) {
      throw ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "can't submit session feedback unless attendance has been recorded")
    }

    appointment.appointmentFeedbackSubmittedAt = OffsetDateTime.now()
    appointment.appointmentFeedbackSubmittedBy = authUserRepository.save(submitter)
    deliverySessionRepository.save(session)

    actionPlanAppointmentEventPublisher.attendanceRecordedEvent(session, appointment.attended!! == Attended.NO)

    if (appointment.attendanceBehaviourSubmittedAt != null) { // excluding the case of non attendance
      actionPlanAppointmentEventPublisher.behaviourRecordedEvent(session, appointment.notifyPPOfAttendanceBehaviour!!)
    }

    actionPlanAppointmentEventPublisher.sessionFeedbackRecordedEvent(session, appointment.notifyPPOfAttendanceBehaviour ?: false)
    return session
  }

  fun getSessions(referralId: UUID): List<DeliverySession> {
    return deliverySessionRepository.findAllByReferralId(referralId)
  }

  fun getSession(referralId: UUID, sessionNumber: Int): DeliverySession {
    return getDeliverySessionOrThrowException(referralId, sessionNumber)
  }

  private fun setAttendanceFields(
    appointment: Appointment,
    attended: Attended,
    additionalInformation: String?,
    actor: AuthUser,
  ) {
    appointment.attended = attended
    additionalInformation?.let { appointment.additionalAttendanceInformation = additionalInformation }
    appointment.attendanceSubmittedAt = OffsetDateTime.now()
    appointment.attendanceSubmittedBy = authUserRepository.save(actor)
  }

  private fun setBehaviourFields(
    appointment: Appointment,
    behaviour: String,
    notifyProbationPractitioner: Boolean,
    actor: AuthUser,
  ) {
    appointment.attendanceBehaviour = behaviour
    appointment.attendanceBehaviourSubmittedAt = OffsetDateTime.now()
    appointment.attendanceBehaviourSubmittedBy = authUserRepository.save(actor)
    appointment.notifyPPOfAttendanceBehaviour = notifyProbationPractitioner
  }

  private fun checkSessionIsNotDuplicate(actionPlanId: UUID, sessionNumber: Int) {
    getDeliverySessionByActionPlanId(actionPlanId, sessionNumber)?.let {
      throw EntityExistsException("Action plan session already exists for [id=$actionPlanId, sessionNumber=$sessionNumber]")
    }
  }

  private fun getDeliverySessionOrThrowException(referralId: UUID, sessionNumber: Int): DeliverySession =
    getDeliverySession(referralId, sessionNumber)
      ?: throw EntityNotFoundException("Action plan session not found [referralId=$referralId, sessionNumber=$sessionNumber]")

  private fun getDeliverySession(referralId: UUID, sessionNumber: Int) =
    deliverySessionRepository.findByReferralIdAndSessionNumber(referralId, sessionNumber)

  private fun getDeliverySessionByActionPlanIdOrThrowException(actionPlanId: UUID, sessionNumber: Int): DeliverySession =
    getDeliverySessionByActionPlanId(actionPlanId, sessionNumber)
      ?: throw EntityNotFoundException("Action plan session not found [actionPlanId=$actionPlanId, sessionNumber=$sessionNumber]")

  private fun getDeliverySessionByActionPlanId(actionPlanId: UUID, sessionNumber: Int) =
    deliverySessionRepository.findAllByActionPlanIdAndSessionNumber(actionPlanId, sessionNumber)
}