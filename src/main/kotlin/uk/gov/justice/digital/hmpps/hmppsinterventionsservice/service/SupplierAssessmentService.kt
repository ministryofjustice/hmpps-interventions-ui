package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SupplierAssessment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.SupplierAssessmentRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityNotFoundException
import javax.transaction.Transactional

@Service
@Transactional
class SupplierAssessmentService(
  val supplierAssessmentRepository: SupplierAssessmentRepository,
  val referralRepository: ReferralRepository,
  val appointmentRepository: AppointmentRepository,
  val authUserRepository: AuthUserRepository,
) {
  fun createSupplierAssessment(
    referral: Referral,
  ): Referral {
    referral.supplierAssessment = supplierAssessmentRepository.save(
      SupplierAssessment(
        id = UUID.randomUUID(),
        referral = referral,
      )
    )
    return referralRepository.save(referral)
  }

  fun createOrUpdateSupplierAssessmentAppointment(
    supplierAssessmentId: UUID,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser
  ): Appointment {
    val supplierAssessment = getSupplierAssessmentById(supplierAssessmentId)

    val noAppointment = supplierAssessment.appointments.size == 0
    if (noAppointment) {
      return scheduleSupplierAssessmentAppointment(supplierAssessment, durationInMinutes, appointmentTime, createdByUser)
    }

    val appointmentWithoutAttendanceRecorded = supplierAssessment.currentAppointment.attended == null
    if (appointmentWithoutAttendanceRecorded) {
      return updateSupplierAssessmentAppointment(supplierAssessment, durationInMinutes, appointmentTime)
    }

    val appointmentWithNonAttendance = supplierAssessment.currentAppointment.attended == Attended.NO
    if (appointmentWithNonAttendance) {
      return scheduleSupplierAssessmentAppointment(supplierAssessment, durationInMinutes, appointmentTime, createdByUser)
    }

    throw IllegalStateException("Is it not possible to update an appointment that has already been attended")
  }

  private fun scheduleSupplierAssessmentAppointment(
    supplierAssessment: SupplierAssessment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser
  ): Appointment {
    val appointment = Appointment(
      id = UUID.randomUUID(),
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now()
    )
    supplierAssessment.appointments.add(
      appointmentRepository.save(appointment)
    )
    supplierAssessmentRepository.save(supplierAssessment)
    return appointment
  }

  private fun updateSupplierAssessmentAppointment(
    supplierAssessment: SupplierAssessment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime
  ): Appointment {
    supplierAssessment.currentAppointment.durationInMinutes = durationInMinutes
    supplierAssessment.currentAppointment.appointmentTime = appointmentTime
    return appointmentRepository.save(supplierAssessment.currentAppointment)
  }

  fun getSupplierAssessmentById(supplierAssessmentId: UUID): SupplierAssessment {
    return supplierAssessmentRepository.findById(supplierAssessmentId).orElseThrow {
      throw EntityNotFoundException("Supplier Assessment not found [id=$supplierAssessmentId]")
    }
  }
}
