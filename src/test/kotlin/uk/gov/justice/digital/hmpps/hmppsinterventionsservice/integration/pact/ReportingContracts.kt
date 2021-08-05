package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.pact

import au.com.dius.pact.provider.junitsupport.State
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration.SetupAssistant
import java.time.OffsetDateTime
import java.time.ZoneOffset

class ReportingContracts(private val setupAssistant: SetupAssistant) {
  @State("there are referrals available for the reporting period of 1 June 2021 to 10 June 2021")
  fun `create referral with specified sentAt date`() {
    setupAssistant.createSentReferral(sentAt = OffsetDateTime.of(2021, 6, 5, 12, 30, 0, 0, ZoneOffset.UTC))
  }
}
