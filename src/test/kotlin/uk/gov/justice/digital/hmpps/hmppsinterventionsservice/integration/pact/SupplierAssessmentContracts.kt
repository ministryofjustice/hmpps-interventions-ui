package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.SetupAssistant
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import java.util.UUID

class SupplierAssessmentContracts(private val setupAssistant: SetupAssistant) {
  @State("a sent referral with ID cbf2f82b-4581-4fe1-9de1-1b52465f1afa exists, and a supplier assessment appointment has not yet been booked for it")
  fun `create a sent referral with no supplier assessmen appointmnet`() {
    setupAssistant.createSentReferral(id = UUID.fromString("cbf2f82b-4581-4fe1-9de1-1b52465f1afa"))
  }

  @State("a sent referral with ID a38d9184-5498-4049-af16-3d8eb2547962 exists, and it has a supplier assessment appointment booked with no feedback yet submitted")
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
}
