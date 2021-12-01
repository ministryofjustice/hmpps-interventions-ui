package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDelivery
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryAddress
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException
import javax.transaction.Transactional

@Service
@Transactional
class AppointmentService(
  val appointmentRepository: AppointmentRepository,
  val communityAPIBookingService: CommunityAPIBookingService,
  val appointmentDeliveryRepository: AppointmentDeliveryRepository,
  val authUserRepository: AuthUserRepository,
  val appointmentEventPublisher: AppointmentEventPublisher,
  val referralRepository: ReferralRepository,
) {

  // TODO complexity of this method can be reduced
  fun createOrUpdateAppointment(
    referral: Referral,
    appointment: Appointment?,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    appointmentType: AppointmentType,
    createdByUser: AuthUser,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentSessionType: AppointmentSessionType?,
    appointmentDeliveryAddress: AddressDTO? = null,
    npsOfficeCode: String? = null,
    attended: Attended? = null,
    additionalAttendanceInformation: String? = null,
    notifyProbationPractitioner: Boolean? = null,
    behaviourDescription: String? = null,
  ): Appointment {
    val appointment = when {
      // an initial appointment is required
      appointment == null -> {
        val deliusAppointmentId =
          communityAPIBookingService.book(referral, null, appointmentTime, durationInMinutes, appointmentType, npsOfficeCode, attended, notifyProbationPractitioner)
        createAppointment(
          durationInMinutes,
          appointmentTime,
          deliusAppointmentId,
          createdByUser,
          appointmentDeliveryType,
          appointmentSessionType,
          appointmentDeliveryAddress,
          referral,
          npsOfficeCode,
          attended,
          additionalAttendanceInformation,
          notifyProbationPractitioner,
          behaviourDescription
        )
      }
      // the current appointment needs to be updated
      appointment!!.attended == null -> {
        val deliusAppointmentId =
          communityAPIBookingService.book(referral, appointment, appointmentTime, durationInMinutes, appointmentType, npsOfficeCode)
        updateAppointment(
          appointment,
          durationInMinutes,
          appointmentTime,
          deliusAppointmentId,
          appointmentDeliveryType,
          appointmentSessionType,
          appointmentDeliveryAddress,
          npsOfficeCode
        )
      }
      // an additional appointment is required
      appointment.attended == Attended.NO -> {
        val deliusAppointmentId =
          communityAPIBookingService.book(referral, null, appointmentTime, durationInMinutes, appointmentType, npsOfficeCode, attended, notifyProbationPractitioner)
        createAppointment(
          durationInMinutes,
          appointmentTime,
          deliusAppointmentId,
          createdByUser,
          appointmentDeliveryType,
          appointmentSessionType,
          appointmentDeliveryAddress,
          referral,
          npsOfficeCode,
          attended,
          additionalAttendanceInformation,
          notifyProbationPractitioner,
          behaviourDescription
        )
      }
      // the appointment has already been attended
      else -> throw IllegalStateException("Is it not possible to update an appointment that has already been attended")
    }

    appointmentEventPublisher.appointmentScheduledEvent(appointment, appointmentType)

    return appointment
  }

  fun createOrUpdateAppointmentDeliveryDetails(
    appointment: Appointment,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentSessionType: AppointmentSessionType?,
    appointmentDeliveryAddressDTO: AddressDTO?,
    npsOfficeCode: String? = null
  ) {
    var appointmentDelivery = appointment.appointmentDelivery
    if (appointmentDelivery == null) {
      appointmentDelivery = AppointmentDelivery(appointmentId = appointment.id, appointmentDeliveryType = appointmentDeliveryType, appointmentSessionType = appointmentSessionType, npsOfficeCode = npsOfficeCode)
    } else {
      appointmentDelivery.appointmentDeliveryType = appointmentDeliveryType
      appointmentDelivery.appointmentSessionType = appointmentSessionType
      appointmentDelivery.npsOfficeCode = npsOfficeCode
    }
    appointment.appointmentDelivery = appointmentDelivery
    appointmentRepository.saveAndFlush(appointment)
    if (appointmentDeliveryType == AppointmentDeliveryType.IN_PERSON_MEETING_OTHER) {
      appointmentDelivery.appointmentDeliveryAddress =
        createOrUpdateAppointmentDeliveryAddress(appointmentDelivery, appointmentDeliveryAddressDTO!!)
      appointmentDeliveryRepository.saveAndFlush(appointmentDelivery)
    }
  }

  fun recordBehaviour(
    appointment: Appointment,
    behaviourDescription: String,
    notifyProbationPractitioner: Boolean,
    submittedBy: AuthUser
  ): Appointment {
    if (appointment.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(
        HttpStatus.CONFLICT,
        "Feedback has already been submitted for this appointment [id=${appointment.id}]"
      )
    }
    setBehaviourFields(appointment, behaviourDescription, notifyProbationPractitioner, submittedBy)
    return appointmentRepository.save(appointment)
  }

  fun recordAppointmentAttendance(
    appointment: Appointment,
    attended: Attended,
    additionalAttendanceInformation: String?,
    submittedBy: AuthUser
  ): Appointment {
    if (appointment.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(
        HttpStatus.CONFLICT,
        "Feedback has already been submitted for this appointment [id=${appointment.id}]"
      )
    }
    setAttendanceFields(appointment, attended, additionalAttendanceInformation, submittedBy)
    return appointmentRepository.save(appointment)
  }

  fun submitSessionFeedback(
    appointment: Appointment,
    submitter: AuthUser,
    appointmentType: AppointmentType
  ): Appointment {
    if (appointment.appointmentFeedbackSubmittedAt != null) {
      throw ResponseStatusException(HttpStatus.CONFLICT, "appointment feedback has already been submitted")
    }

    if (appointment.attendanceSubmittedAt == null) {
      throw ResponseStatusException(
        HttpStatus.UNPROCESSABLE_ENTITY,
        "can't submit feedback unless attendance has been recorded"
      )
    }

    appointment.appointmentFeedbackSubmittedAt = OffsetDateTime.now()
    appointment.appointmentFeedbackSubmittedBy = authUserRepository.save(submitter)
    appointmentRepository.save(appointment)

    appointmentEventPublisher.attendanceRecordedEvent(
      appointment,
      appointment.attended!! == Attended.NO,
      appointmentType
    )

    if (appointment.attendanceBehaviourSubmittedAt != null) { // excluding the case of non attendance
      appointmentEventPublisher.behaviourRecordedEvent(
        appointment,
        appointment.notifyPPOfAttendanceBehaviour!!,
        appointmentType
      )
    }

    appointmentEventPublisher.sessionFeedbackRecordedEvent(
      appointment,
      appointment.notifyPPOfAttendanceBehaviour ?: false,
      appointmentType
    )

    return appointment
  }

  private fun setAttendanceFields(
    appointment: Appointment,
    attended: Attended,
    additionalInformation: String?,
    submittedBy: AuthUser,
  ) {
    appointment.attended = attended
    additionalInformation?.let { appointment.additionalAttendanceInformation = additionalInformation }
    appointment.attendanceSubmittedAt = OffsetDateTime.now()
    appointment.attendanceSubmittedBy = authUserRepository.save(submittedBy)
  }

  private fun setBehaviourFields(
    appointment: Appointment,
    behaviour: String,
    notifyProbationPractitioner: Boolean,
    submittedBy: AuthUser,
  ) {
    appointment.attendanceBehaviour = behaviour
    appointment.attendanceBehaviourSubmittedAt = OffsetDateTime.now()
    appointment.notifyPPOfAttendanceBehaviour = notifyProbationPractitioner
    appointment.attendanceBehaviourSubmittedBy = authUserRepository.save(submittedBy)
  }

  private fun createAppointment(
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    deliusAppointmentId: Long?,
    createdByUser: AuthUser,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentSessionType: AppointmentSessionType?,
    appointmentDeliveryAddress: AddressDTO? = null,
    referral: Referral,
    npsOfficeCode: String?,
    attended: Attended?,
    additionalAttendanceInformation: String?,
    notifyProbationPractitioner: Boolean?,
    behaviourDescription: String?,
  ): Appointment {
    val appointment = Appointment(
      id = UUID.randomUUID(),
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = deliusAppointmentId,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now(),
      referral = referral,
    )
    setAttendanceAndBehaviourIfHistoricAppointment(appointment, appointmentTime, attended, additionalAttendanceInformation, behaviourDescription, notifyProbationPractitioner, createdByUser)
    appointmentRepository.saveAndFlush(appointment)
    createOrUpdateAppointmentDeliveryDetails(appointment, appointmentDeliveryType, appointmentSessionType, appointmentDeliveryAddress, npsOfficeCode)
    return appointment
  }

  private fun updateAppointment(
    appointment: Appointment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    deliusAppointmentId: Long?,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentSessionType: AppointmentSessionType?,
    appointmentDeliveryAddress: AddressDTO? = null,
    npsOfficeCode: String?,
  ): Appointment {
    appointment.durationInMinutes = durationInMinutes
    appointment.appointmentTime = appointmentTime
    appointment.deliusAppointmentId = deliusAppointmentId
    val appointment = appointmentRepository.save(appointment)
    createOrUpdateAppointmentDeliveryDetails(appointment, appointmentDeliveryType, appointmentSessionType, appointmentDeliveryAddress, npsOfficeCode)
    return appointment
  }

  private fun createOrUpdateAppointmentDeliveryAddress(
    appointmentDelivery: AppointmentDelivery,
    appointmentDeliveryAddressDTO: AddressDTO
  ): AppointmentDeliveryAddress {
    var appointmentDeliveryAddress = appointmentDelivery.appointmentDeliveryAddress
    if (appointmentDeliveryAddress == null) {
      appointmentDeliveryAddress = AppointmentDeliveryAddress(
        appointmentDeliveryId = appointmentDelivery.appointmentId,
        firstAddressLine = appointmentDeliveryAddressDTO.firstAddressLine,
        secondAddressLine = appointmentDeliveryAddressDTO.secondAddressLine,
        townCity = appointmentDeliveryAddressDTO.townOrCity,
        county = appointmentDeliveryAddressDTO.county,
        postCode = appointmentDeliveryAddressDTO.postCode
      )
    } else {
      appointmentDeliveryAddress.firstAddressLine = appointmentDeliveryAddressDTO.firstAddressLine
      appointmentDeliveryAddress.secondAddressLine = appointmentDeliveryAddressDTO.secondAddressLine
      appointmentDeliveryAddress.townCity = appointmentDeliveryAddressDTO.townOrCity
      appointmentDeliveryAddress.county = appointmentDeliveryAddressDTO.county
      appointmentDeliveryAddress.postCode = appointmentDeliveryAddressDTO.postCode
    }
    return appointmentDeliveryAddress
  }

  fun scheduleNewAppointment(
    sentReferralId: UUID,
    appointmentType: AppointmentType,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentSessionType: AppointmentSessionType,
    appointmentDeliveryAddress: AddressDTO? = null,
    npsOfficeCode: String? = null,
  ): Appointment {
    val sentReferral = referralRepository.findByIdAndSentAtIsNotNull(sentReferralId) ?: throw EntityNotFoundException(
      "Sent Referral not found [referralId=$sentReferralId]"
    )
    val deliusAppointmentId =
      communityAPIBookingService.book(sentReferral, null, appointmentTime, durationInMinutes, appointmentType, npsOfficeCode)
    val appointment = Appointment(
      id = UUID.randomUUID(),
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = deliusAppointmentId,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now(),
      referral = sentReferral,
    )
    appointmentRepository.saveAndFlush(appointment)
    createOrUpdateAppointmentDeliveryDetails(appointment, appointmentDeliveryType, appointmentSessionType, appointmentDeliveryAddress, npsOfficeCode)
    appointmentEventPublisher.appointmentScheduledEvent(appointment, appointmentType)
    return appointment
  }

  // TODO: Add updatedBy/updatedAt to Appointment entity?
  fun rescheduleExistingAppointment(
    appointmentId: UUID,
    appointmentType: AppointmentType,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentSessionType: AppointmentSessionType,
    appointmentDeliveryAddress: AddressDTO? = null,
    npsOfficeCode: String? = null,
  ): Appointment {
    val appointment = this.appointmentRepository.findById(appointmentId).orElseThrow { EntityNotFoundException("Appointment not found [appointmentId=$appointmentId]") }
    appointment.appointmentFeedbackSubmittedAt ?.let { throw EntityExistsException("Appointment has already been delivered [appointmentId=$appointmentId]") }
    val deliusAppointmentId =
      communityAPIBookingService.book(appointment.referral, appointment, appointmentTime, durationInMinutes, appointmentType, npsOfficeCode)
    appointment.durationInMinutes = durationInMinutes
    appointment.appointmentTime = appointmentTime
    appointment.deliusAppointmentId = deliusAppointmentId
    appointmentRepository.save(appointment)
    createOrUpdateAppointmentDeliveryDetails(appointment, appointmentDeliveryType, appointmentSessionType, appointmentDeliveryAddress, npsOfficeCode)
    appointmentEventPublisher.appointmentScheduledEvent(appointment, appointmentType)
    return appointment
  }

  private fun setAttendanceAndBehaviourIfHistoricAppointment(
    appointment: Appointment,
    appointmentTime: OffsetDateTime,
    attended: Attended?,
    additionalAttendanceInformation: String?,
    behaviourDescription: String?,
    notifyProbationPractitioner: Boolean?,
    updatedBy: AuthUser
  ) {
    if (appointmentTime.isBefore(OffsetDateTime.now())) {
      setAttendanceFields(appointment, attended!!, additionalAttendanceInformation, updatedBy)
      if (Attended.NO != attended) {
        setBehaviourFields(appointment, behaviourDescription!!, notifyProbationPractitioner!!, updatedBy)
      }
      appointment.appointmentFeedbackSubmittedAt = OffsetDateTime.now()
      appointment.appointmentFeedbackSubmittedBy = updatedBy
    }
  }
}
