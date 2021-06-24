package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDelivery
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryAddress
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryRepository
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
  val appointmentDeliveryRepository: AppointmentDeliveryRepository,
  val authUserRepository: AuthUserRepository,
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
    appointmentDeliveryAddress: AddressDTO? = null,
  ): Appointment {

    val initialAppointmentRequired = appointment == null
    if (initialAppointmentRequired) {
      val deliusAppointmentId = communityAPIBookingService.book(referral, null, appointmentTime, durationInMinutes, appointmentType)
      return createAppointment(durationInMinutes, appointmentTime, deliusAppointmentId, createdByUser, appointmentDeliveryType, appointmentDeliveryAddress)
    }

    val updateCurrentAppointmentRequired = appointment!!.attended == null
    if (updateCurrentAppointmentRequired) {
      val deliusAppointmentId = communityAPIBookingService.book(referral, appointment, appointmentTime, durationInMinutes, appointmentType)
      return updateAppointment(appointment, durationInMinutes, appointmentTime, deliusAppointmentId, appointmentDeliveryType, appointmentDeliveryAddress)
    }

    val additionalAppointmentRequired = appointment.attended == Attended.NO
    if (additionalAppointmentRequired) {
      val deliusAppointmentId = communityAPIBookingService.book(referral, null, appointmentTime, durationInMinutes, appointmentType)
      return createAppointment(durationInMinutes, appointmentTime, deliusAppointmentId, createdByUser, appointmentDeliveryType, appointmentDeliveryAddress)
    }
    throw IllegalStateException("Is it not possible to update an appointment that has already been attended")
  }

  fun createOrUpdateAppointmentDeliveryDetails(appointment: Appointment, appointmentDeliveryType: AppointmentDeliveryType, appointmentDeliveryAddressDTO: AddressDTO?) {
    var appointmentDelivery = appointment.appointmentDelivery
    if (appointmentDelivery == null) {
      appointmentDelivery = AppointmentDelivery(appointmentId = appointment.id, appointmentDeliveryType = appointmentDeliveryType)
    }
    appointmentDelivery.appointmentDeliveryType = appointmentDeliveryType
    appointment.appointmentDelivery = appointmentDelivery
    appointmentRepository.saveAndFlush(appointment)
    if (appointmentDeliveryType == AppointmentDeliveryType.IN_PERSON_MEETING_OTHER) {
      appointmentDelivery.appointmentDeliveryAddress = createOrUpdateAppointmentDeliveryAddress(appointmentDelivery, appointmentDeliveryAddressDTO!!)
      appointmentDeliveryRepository.saveAndFlush(appointmentDelivery)
    }
  }

  private fun createAppointment(
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    deliusAppointmentId: Long?,
    createdByUser: AuthUser,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentDeliveryAddress: AddressDTO? = null,
  ): Appointment {
    val appointment = Appointment(
      id = UUID.randomUUID(),
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = deliusAppointmentId,
      createdBy = authUserRepository.save(createdByUser),
      createdAt = OffsetDateTime.now()
    )
    appointmentRepository.saveAndFlush(appointment)
    createOrUpdateAppointmentDeliveryDetails(appointment, appointmentDeliveryType, appointmentDeliveryAddress)
    return appointment
  }

  private fun updateAppointment(
    appointment: Appointment,
    durationInMinutes: Int,
    appointmentTime: OffsetDateTime,
    deliusAppointmentId: Long?,
    appointmentDeliveryType: AppointmentDeliveryType,
    appointmentDeliveryAddress: AddressDTO? = null,
  ): Appointment {
    appointment.durationInMinutes = durationInMinutes
    appointment.appointmentTime = appointmentTime
    appointment.deliusAppointmentId = deliusAppointmentId
    val appointment = appointmentRepository.save(appointment)
    createOrUpdateAppointmentDeliveryDetails(appointment, appointmentDeliveryType, appointmentDeliveryAddress)
    return appointment
  }

  private fun createOrUpdateAppointmentDeliveryAddress(appointmentDelivery: AppointmentDelivery, appointmentDeliveryAddressDTO: AddressDTO): AppointmentDeliveryAddress {
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
}
