package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Engagement
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityManager
import javax.transaction.Transactional

@Service
@Transactional
class EngagementService(
  val entityManager: EntityManager,
  val appointmentRepository: AppointmentRepository,
  val authUserRepository: AuthUserRepository,
) {
  fun createOrUpdateEngagement(
    engagement: Engagement,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser
  ): Appointment {
    val noAppointment = engagement.appointments.size == 0
    if (noAppointment) {
      return createAppointment(engagement, durationInMinutes, appointmentTime, createdByUser)
    }

    val appointmentWithoutAttendanceRecorded = engagement.currentAppointment.attended == null
    if (appointmentWithoutAttendanceRecorded) {
      return updateAppointment(engagement, durationInMinutes, appointmentTime)
    }

    val appointmentWithNonAttendance = engagement.currentAppointment.attended == Attended.NO
    if (appointmentWithNonAttendance) {
      return createAppointment(engagement, durationInMinutes, appointmentTime, createdByUser)
    }
    throw IllegalStateException("Is it not possible to update an appointment that has already been attended")
  }

  private fun createAppointment(
    engagement: Engagement,
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
    engagement.appointments.add(
      appointmentRepository.save(appointment)
    )
    entityManager.persist(engagement)
    return appointment
  }

  private fun updateAppointment(
    engagement: Engagement,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime
  ): Appointment {
    engagement.currentAppointment.durationInMinutes = durationInMinutes
    engagement.currentAppointment.appointmentTime = appointmentTime
    return appointmentRepository.save(engagement.currentAppointment)
  }
}
