package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.SetupAssistant
import java.util.UUID

class CaseNoteContracts(private val setupAssistant: SetupAssistant) {
  @State("There is an existing sent referral with ID of 03bf1369-00d3-4b7f-88b2-da3cc8cc35b9, and it has 20 case notes")
  fun `create referral with 20 case notes`() {
    val referral = setupAssistant.createAssignedReferral(id = UUID.fromString("03bf1369-00d3-4b7f-88b2-da3cc8cc35b9"))
    for (i in 1..20) {
      setupAssistant.createCaseNote(referral, subject = "subject for case note $i of 20", body = "body for case note $i of 20")
    }
  }
}
