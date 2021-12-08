package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentSessionType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType.SUPPLIER_ASSESSMENT
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SupplierAssessment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.SupplierAssessmentRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException
import javax.transaction.Transactional

@Service
@Transactional
class SupplierAssessmentService(
  val supplierAssessmentRepository: SupplierAssessmentRepository,
  val referralRepository: ReferralRepository,
  val appointmentService: AppointmentService,
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
    supplierAssessment: SupplierAssessment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentSessionType: AppointmentSessionType? = null,
    appointmentDeliveryAddress: AddressDTO? = null,
    npsOfficeCode: String? = null,
  ): Appointment {
    val appointment = appointmentService.createOrUpdateAppointment(
      supplierAssessment.referral,
      supplierAssessment.currentAppointment,
      durationInMinutes,
      appointmentTime,
      SUPPLIER_ASSESSMENT,
      createdByUser,
      appointmentDeliveryType,
      appointmentSessionType,
      appointmentDeliveryAddress,
      npsOfficeCode,
    )
    supplierAssessment.appointments.add(appointment)
    supplierAssessmentRepository.save(supplierAssessment)
    return appointment
  }

  fun scheduleNewSupplierAssessmentAppointment(
    referralId: UUID,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    createdByUser: AuthUser,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentDeliveryAddress: AddressDTO? = null,
    npsOfficeCode: String? = null,
  ): Appointment {

    val sentReferral = referralRepository.findByIdAndSentAtIsNotNull(referralId) ?: throw EntityNotFoundException("Sent Referral not found [referralId=$referralId]")
    val supplierAssessment = sentReferral.supplierAssessment ?: run {
      SupplierAssessment(
        id = UUID.randomUUID(),
        referral = sentReferral,
      )
    }
    supplierAssessment.currentAppointment?.let {
      latestAppointment ->
      if (latestAppointment.appointmentTime.isAfter(appointmentTime)) {
        throw EntityExistsException("can't schedule new supplier assessment appointment; new appointment occurs before previously scheduled appointment [referralId=$referralId]")
      }
      latestAppointment.appointmentFeedbackSubmittedAt ?: throw ValidationError("can't schedule new supplier assessment appointment; latest appointment has no feedback delivered [referralId=$referralId]", listOf())
    }
    val appointment = appointmentService.scheduleNewAppointment(
      sentReferral.id,
      SUPPLIER_ASSESSMENT,
      durationInMinutes,
      appointmentTime,
      createdByUser,
      appointmentDeliveryType,
      // Supplier assessment is always ONE_TO_ONE
      AppointmentSessionType.ONE_TO_ONE,
      appointmentDeliveryAddress,
      npsOfficeCode,
    )
    supplierAssessment.appointments.add(appointment)
    supplierAssessmentRepository.save(supplierAssessment)
    return appointment
  }

  fun getSupplierAssessmentById(supplierAssessmentId: UUID): SupplierAssessment {
    return supplierAssessmentRepository.findByIdOrNull(supplierAssessmentId)
      ?: throw EntityNotFoundException("Supplier Assessment not found [id=$supplierAssessmentId]")
  }
}
