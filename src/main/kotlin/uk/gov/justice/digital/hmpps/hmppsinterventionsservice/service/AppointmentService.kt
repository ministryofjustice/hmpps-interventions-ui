package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional

@Service
@Transactional
class AppointmentService(
  val appointmentRepository: AppointmentRepository,
  val communityAPIBookingService: CommunityAPIBookingService,
  val authUserRepository: AuthUserRepository,
) {
  fun createOrUpdateAppointment(
    referral: Referral,
    appointment: Appointment?,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    appointmentType: AppointmentType,
    createdByUser: AuthUser
  ): Appointment {

    val initialAppointmentRequired = appointment == null
    if (initialAppointmentRequired) {
      val deliusAppointmentId = communityAPIBookingService.book(referral, null, appointmentTime, durationInMinutes, appointmentType)
      val createdAppointment = createAppointment(durationInMinutes, appointmentTime, deliusAppointmentId, createdByUser)
      return appointmentRepository.save(createdAppointment)
    }

    val updateCurrentAppointmentRequired = appointment!!.attended == null
    if (updateCurrentAppointmentRequired) {
      val deliusAppointmentId = communityAPIBookingService.book(referral, appointment, appointmentTime, durationInMinutes, appointmentType)
      val updatedAppointment = updateAppointment(appointment, durationInMinutes, appointmentTime, deliusAppointmentId)
      return appointmentRepository.save(updatedAppointment)
    }

    val additionalAppointmentRequired = appointment.attended == Attended.NO
    if (additionalAppointmentRequired) {
      val deliusAppointmentId = communityAPIBookingService.book(referral, null, appointmentTime, durationInMinutes, appointmentType)
      val additionalAppointment = createAppointment(durationInMinutes, appointmentTime, deliusAppointmentId, createdByUser)
      return appointmentRepository.save(additionalAppointment)
    }

    throw IllegalStateException("Is it not possible to update an appointment that has already been attended")
  }

  private fun createAppointment(
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    deliusAppointmentId: Long?,
    createdByUser: AuthUser,
  ): Appointment {
    return Appointment(
      id = UUID.randomUUID(),
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = deliusAppointmentId,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now()
    )
  }

  private fun updateAppointment(
    appointment: Appointment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    deliusAppointmentId: Long?,
  ): Appointment {
    appointment.durationInMinutes = durationInMinutes
    appointment.appointmentTime = appointmentTime
    appointment.deliusAppointmentId = deliusAppointmentId
    return appointment
  }
}
