package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.SetupAssistant
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import java.util.UUID

class SupplierAssessmentContracts(private val setupAssistant: SetupAssistant) {
  @State("a sent referral with ID cbf2f82b-4581-4fe1-9de1-1b52465f1afa exists, and a supplier assessment appointment has not yet been booked for it")
  fun `create a sent referral with no supplier assessmen appointmnet`() {
    setupAssistant.createSentReferral(id = UUID.fromString("cbf2f82b-4581-4fe1-9de1-1b52465f1afa"))
  }

  @State("a sent referral with ID a38d9184-5498-4049-af16-3d8eb2547962 exists, and it has a phone call supplier assessment appointment booked with no feedback yet submitted")
  fun `create a sent referral with supplier assessment appointment with no feedback`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("a38d9184-5498-4049-af16-3d8eb2547962"))
    setupAssistant.addSupplierAssessmentAppointment(referral.supplierAssessment!!, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL)
  }

  @State("a supplier assessment with ID 77f6c5cf-9772-4731-9a9a-97f2f53f2770 exists")
  fun `create a sent referral with a supplier assessment having a video call appointment`() {
    val supplierAssessment = setupAssistant.createSupplierAssessment(id = UUID.fromString("77f6c5cf-9772-4731-9a9a-97f2f53f2770"))
    setupAssistant.addSupplierAssessmentAppointment(supplierAssessment!!, appointmentDeliveryType = AppointmentDeliveryType.VIDEO_CALL)
  }

  @State("a supplier assessment with ID 4567945e-73be-43f0-9021-74c4a8ce49db exists")
  fun `create a sent referral with a supplier assessment having a phone call appointment`() {
    val supplierAssessment = setupAssistant.createSupplierAssessment(id = UUID.fromString("4567945e-73be-43f0-9021-74c4a8ce49db"))
    setupAssistant.addSupplierAssessmentAppointment(supplierAssessment!!, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL)
  }

  @State("a supplier assessment with ID fb10c5fe-12ce-482f-8ca1-104974ab21f5 exists")
  fun `create a sent referral with a supplier assessment having a location appointment`() {
    val supplierAssessment = setupAssistant.createSupplierAssessment(id = UUID.fromString("fb10c5fe-12ce-482f-8ca1-104974ab21f5"))
    val addressDTO = AddressDTO(
      firstAddressLine = "Harmony Living Office, Room 4",
      secondAddressLine = "44 Bouverie Road",
      townOrCity = "Blackpool",
      county = "Lancashire",
      postCode = "SY40RE"
    )
    setupAssistant.addSupplierAssessmentAppointment(supplierAssessment!!, appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_OTHER, appointmentDeliveryAddress = addressDTO)
  }

  @State("There is an existing sent referral with ID 58963698-0f2e-4d6e-a072-0e2cf351f3b2 and the supplier assessment has been booked but no feedback details have yet been submitted")
  fun `create a sent referral with supplier assessment without any feedback`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("58963698-0f2e-4d6e-a072-0e2cf351f3b2"))
    setupAssistant.addSupplierAssessmentAppointment(referral.supplierAssessment!!, referral = referral, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL)
  }

  @State("There is an existing sent referral with ID caac2a85-578f-4b0b-996d-2893311eb60e and the supplier assessment attendance details have been recorded")
  fun `create a sent referral with supplier assessment having attendance recorded`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("caac2a85-578f-4b0b-996d-2893311eb60e"))
    val attended = Attended.YES
    val additionalAttendanceInformation = "Alex picked up the phone on time."
    setupAssistant.addSupplierAssessmentAppointment(referral.supplierAssessment!!, referral = referral, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL, attended = attended, additionalAttendanceInformation = additionalAttendanceInformation)
  }

  @State("There is an existing sent referral with ID cd8f46a2-78f2-457b-ab14-7d77adce73d1 and the supplier assessment attendance and behaviour details have been recorded")
  fun `create a sent referral with supplier assessment having behaviour recorded`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("cd8f46a2-78f2-457b-ab14-7d77adce73d1"))
    val attended = Attended.YES
    val additionalAttendanceInformation = "Alex picked up the phone on time."
    val attendanceBehaviour = "We were having a good time on the phone."
    val notifyPPOfAttendanceBehaviour = false
    setupAssistant.addSupplierAssessmentAppointment(referral.supplierAssessment!!, referral = referral, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL, attended = attended, additionalAttendanceInformation = additionalAttendanceInformation, attendanceBehaviour = attendanceBehaviour, notifyPPOfAttendanceBehaviour = notifyPPOfAttendanceBehaviour)
  }

  @State("There is an existing sent referral with ID 61352917-3076-4ad1-bf17-7a37f286dddb and the supplier assessment attendance and behaviour details have been recorded to notify PP")
  fun `create a sent referral with supplier assessment having behaviour recorded with notifying PP`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("61352917-3076-4ad1-bf17-7a37f286dddb"))
    val attended = Attended.YES
    val additionalAttendanceInformation = "Alex picked up the phone on time."
    val attendanceBehaviour = "They hung up the phone after 1 minute."
    val notifyPPOfAttendanceBehaviour = true
    setupAssistant.addSupplierAssessmentAppointment(referral.supplierAssessment!!, referral = referral, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL, attended = attended, additionalAttendanceInformation = additionalAttendanceInformation, attendanceBehaviour = attendanceBehaviour, notifyPPOfAttendanceBehaviour = notifyPPOfAttendanceBehaviour)
  }
}
