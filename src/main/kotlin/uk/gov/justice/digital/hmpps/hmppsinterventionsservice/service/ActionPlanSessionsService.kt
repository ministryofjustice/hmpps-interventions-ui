package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDelivery
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryAddress
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ActionPlanSessionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryAddressRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryRepository
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
  val appointmentDeliveryRepository: AppointmentDeliveryRepository,
  val appointmentDeliveryAddressRepository: AppointmentDeliveryAddressRepository,
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
    // TODO: remove optional when front-end changes are complete
    appointmentDeliveryType: AppointmentDeliveryType? = null,
    appointmentDeliveryAddressLines: List<String>? = null,
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
      var appointment = Appointment(
        id = UUID.randomUUID(),
        createdBy = authUserRepository.save(updatedBy),
        createdAt = OffsetDateTime.now(),
        appointmentTime = appointmentTime,
        durationInMinutes = durationInMinutes,
        deliusAppointmentId = deliusAppointmentId,
      )
      appointmentRepository.saveAndFlush(appointment)

//       TODO: remove optional when front-end changes are complete
      if (appointmentDeliveryType != null) {
        populateAppointmentDelivery(appointment, appointmentDeliveryType, appointmentDeliveryAddressLines)
      }
      session.appointments.add(appointment)
    } else {
      existingAppointment.appointmentTime = appointmentTime
      existingAppointment.durationInMinutes = durationInMinutes
      existingAppointment.deliusAppointmentId = deliusAppointmentId
      appointmentRepository.saveAndFlush(existingAppointment)
      // TODO: remove optional when front-end changes are complete
      if (appointmentDeliveryType != null) {
        populateAppointmentDelivery(existingAppointment, appointmentDeliveryType, appointmentDeliveryAddressLines)
      }
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

  private fun populateAppointmentDelivery(appointment: Appointment, appointmentDeliveryType: AppointmentDeliveryType, appointmentDeliveryAddressLines: List<String>?) {
    var appointmentDelivery = appointment.appointmentDelivery
    if (appointmentDelivery == null) {
      appointmentDelivery = AppointmentDelivery(appointmentId = appointment.id, appointmentDeliveryType = appointmentDeliveryType)
    }
    appointmentDelivery.appointmentDeliveryType = appointmentDeliveryType
    when (appointmentDeliveryType) {
      AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE -> appointmentDelivery.npsOfficeCode = appointmentDeliveryAddressLines!!.first()
    }

    appointment.appointmentDelivery = appointmentDelivery
    appointmentRepository.saveAndFlush(appointment)

    if (appointmentDeliveryType == AppointmentDeliveryType.IN_PERSON_MEETING_OTHER) {
      appointmentDelivery.appointmentDeliveryAddress = populateAppointmentDeliveryAddress(appointmentDelivery, appointmentDeliveryAddressLines!!)
      appointmentDeliveryRepository.saveAndFlush(appointmentDelivery)
    }
  }

  private fun populateAppointmentDeliveryAddress(appointmentDelivery: AppointmentDelivery, appointmentDeliveryAddressLines: List<String>): AppointmentDeliveryAddress {
    var appointmentDeliveryAddress = appointmentDelivery.appointmentDeliveryAddress
    if (appointmentDeliveryAddress == null) {
      appointmentDeliveryAddress = AppointmentDeliveryAddress(
        appointmentDeliveryId = appointmentDelivery.appointmentId,
        firstAddressLine = appointmentDeliveryAddressLines.elementAt(0),
        secondAddressLine = appointmentDeliveryAddressLines.elementAt(1),
        townCity = appointmentDeliveryAddressLines.elementAt(2),
        county = appointmentDeliveryAddressLines.elementAt(3),
        postCode = appointmentDeliveryAddressLines.elementAt(4)
      )
    } else {
      appointmentDeliveryAddress.firstAddressLine = appointmentDeliveryAddressLines.elementAt(0)
      appointmentDeliveryAddress.secondAddressLine = appointmentDeliveryAddressLines.elementAt(1)
      appointmentDeliveryAddress.townCity = appointmentDeliveryAddressLines.elementAt(2)
      appointmentDeliveryAddress.county = appointmentDeliveryAddressLines.elementAt(3)
      appointmentDeliveryAddress.postCode = appointmentDeliveryAddressLines.elementAt(4)
    }
    return appointmentDeliveryAddress
  }
}
