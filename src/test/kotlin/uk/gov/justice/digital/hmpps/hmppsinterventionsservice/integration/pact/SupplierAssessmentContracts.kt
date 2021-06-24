package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.SetupAssistant
import java.util.UUID

class SupplierAssessmentContracts(private val setupAssistant: SetupAssistant) {
  @State("a sent referral with ID cbf2f82b-4581-4fe1-9de1-1b52465f1afa exists, and a supplier assessment appointment has not yet been booked for it")
  fun `create a sent referral with no supplier assessmen appointmnet`() {
    setupAssistant.createSentReferral(id = UUID.fromString("cbf2f82b-4581-4fe1-9de1-1b52465f1afa"))
  }

  @State("a sent referral with ID a38d9184-5498-4049-af16-3d8eb2547962 exists, and it has a supplier assessment appointment booked with no feedback yet submitted")
  fun `create a sent referral with supplier assessment appointment with no feedback`() {
    val referral = setupAssistant.createSentReferral(id = UUID.fromString("a38d9184-5498-4049-af16-3d8eb2547962"))
    setupAssistant.addSupplierAssessmentAppointment(referral.supplierAssessment!!)
  }

  @State("a supplier assessment with ID 77f6c5cf-9772-4731-9a9a-97f2f53f2770 exists")
  fun `create a sent referral with supplier assessment exists`() {
    setupAssistant.createSupplierAssessment(id = UUID.fromString("77f6c5cf-9772-4731-9a9a-97f2f53f2770"))
  }
}
