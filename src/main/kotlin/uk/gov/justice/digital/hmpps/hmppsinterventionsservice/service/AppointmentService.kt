package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional

@Service
@Transactional
class AppointmentService(
  val appointmentRepository: AppointmentRepository,
  val authUserRepository: AuthUserRepository,
) {
  fun createOrUpdateAppointment(
    appointment: Appointment?,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser
  ): Appointment {
    val noAppointment = appointment == null
    if (noAppointment) {
      return createAppointment(durationInMinutes, appointmentTime, createdByUser)
    }

    val appointmentWithoutAttendanceRecorded = appointment!!.attended == null
    if (appointmentWithoutAttendanceRecorded) {
      return updateAppointment(appointment, durationInMinutes, appointmentTime)
    }

    val appointmentWithNonAttendance = appointment.attended == Attended.NO
    if (appointmentWithNonAttendance) {
      return createAppointment(durationInMinutes, appointmentTime, createdByUser)
    }
    throw IllegalStateException("Is it not possible to update an appointment that has already been attended")
  }

  private fun createAppointment(
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser,
  ): Appointment {
    val appointment = Appointment(
      id = UUID.randomUUID(),
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now()
    )
    appointmentRepository.save(appointment)
    return appointment
  }

  private fun updateAppointment(
    appointment: Appointment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime
  ): Appointment {
    appointment.durationInMinutes = durationInMinutes
    appointment.appointmentTime = appointmentTime
    return appointmentRepository.save(appointment)
  }
}
