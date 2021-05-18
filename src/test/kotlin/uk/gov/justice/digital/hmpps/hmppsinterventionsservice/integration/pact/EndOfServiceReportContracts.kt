package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import java.util.UUID

class EndOfServiceReportContracts(private val setupAssistant: SetupAssistant) {
  @State("There is an existing sent referral with ID of 03bf1369-00d3-4b7f-88b2-da3cc8cc35b9, and it has an end of service report")
  fun `create referral with eosr`() {
    val referral = setupAssistant.createAssignedReferral(id = UUID.fromString("03bf1369-00d3-4b7f-88b2-da3cc8cc35b9"))
    setupAssistant.createEndOfServiceReport(referral = referral)
  }

  @State("a sent referral exists with ID 993d7bdf-bab7-4594-8b27-7d9f7061b403")
  fun `create the referral ready to have an eosr created`() {
    setupAssistant.createAssignedReferral(id = UUID.fromString("993d7bdf-bab7-4594-8b27-7d9f7061b403"))
  }

  @State("an end of service report exists with ID 31ad504a-1827-46e4-ac95-68b4e1256659")
  fun `create the eosr with id 31ad504a-1827-46e4-ac95-68b4e1256659`() {
    setupAssistant.createEndOfServiceReport(id = UUID.fromString("31ad504a-1827-46e4-ac95-68b4e1256659"))
  }

  @State("an end of service report exists with ID c1a23b08-5a52-47bb-90c2-37c2f3a409aa")
  fun `create the eosr against a referral with a desired outcome`() {
    val referral = setupAssistant.createAssignedReferral()
    val outcomes = listOf(
      setupAssistant.createDesiredOutcome(
        UUID.fromString("dc4894fa-4088-4999-bf58-5f05495979df"),
        "",
        referral.intervention.dynamicFrameworkContract.contractType.serviceCategories.elementAt(0).id
      )
    )
    setupAssistant.fillReferralFields(referral, desiredOutcomes = outcomes)
    setupAssistant.createEndOfServiceReport(id = UUID.fromString("c1a23b08-5a52-47bb-90c2-37c2f3a409aa"), referral = referral)
  }

  @State("an end of service report exists with ID c3239695-b258-4ac6-9478-cb6929668aaa")
  fun `create the eosr with id c3239695-b258-4ac6-9478-cb6929668aaa`() {
    setupAssistant.createEndOfServiceReport(id = UUID.fromString("c3239695-b258-4ac6-9478-cb6929668aaa"))
  }
}
