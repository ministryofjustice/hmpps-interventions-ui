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
import javax.transaction.Transactional

@Service
@Transactional
class SupplierAssessmentService(
  val supplierAssessmentRepository: SupplierAssessmentRepository,
  val referralRepository: ReferralRepository,
  val appointmentRepository: AppointmentRepository,
  val authUserRepository: AuthUserRepository,
) {
  fun createInitialAssessment(
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

  fun updateSupplierAssessmentAppointment(
    referral: Referral,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser
  ): SupplierAssessment {
    if (referral.supplierAssessment!!.appointments.size == 0) {
      referral.supplierAssessment!!.appointments.add(
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
    } else {
      referral.supplierAssessment!!.appointment.durationInMinutes = durationInMinutes
      referral.supplierAssessment!!.appointment.appointmentTime = appointmentTime
    }
    return supplierAssessmentRepository.save(referral.supplierAssessment!!)
  }
}
