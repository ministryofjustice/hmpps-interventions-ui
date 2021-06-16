package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
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

  fun scheduleOrUpdateSupplierAssessmentAppointment(
    supplierAssessmentId: UUID,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser
  ): Appointment {
    val supplierAssessment = getSupplierAssessmentById(supplierAssessmentId)

    if (supplierAssessment.appointments.size == 0) {
      scheduleSupplierAssessmentAppointment(supplierAssessment, durationInMinutes, appointmentTime, createdByUser)
    } else {
      updateSupplierAssessmentAppointment(supplierAssessment, durationInMinutes, appointmentTime)
    }
    supplierAssessmentRepository.save(supplierAssessment)
    return supplierAssessment.currentAppointment
  }

  private fun scheduleSupplierAssessmentAppointment(
    supplierAssessment: SupplierAssessment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser
  ) {
    supplierAssessment.appointments.add(
      appointmentRepository.save(
        Appointment(
          id = UUID.randomUUID(),
          appointmentTime = appointmentTime,
          durationInMinutes = durationInMinutes,
          createdBy = authUserRepository.save(createdByUser),
          createdAt = OffsetDateTime.now()
        )
      )
    )
  }

  private fun updateSupplierAssessmentAppointment(
    supplierAssessment: SupplierAssessment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime
  ) {
    supplierAssessment.currentAppointment.durationInMinutes = durationInMinutes
    supplierAssessment.currentAppointment.appointmentTime = appointmentTime
  }

  fun getSupplierAssessmentById(supplierAssessmentId: UUID): SupplierAssessment {
    return supplierAssessmentRepository.findById(supplierAssessmentId).orElseThrow {
      throw EntityNotFoundException("Supplier Assessment not found [id=$supplierAssessmentId]")
    }
  }
}
