package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration

import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.State
import au.com.dius.pact.provider.junitsupport.loader.PactBroker
import au.com.dius.pact.provider.junitsupport.loader.VersionSelector
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

@Provider("Interventions Service")
@PactBroker(
  host = "pact-broker-prod.apps.live-1.cloud-platform.service.justice.gov.uk",
  scheme = "https",
  consumerVersionSelectors = [VersionSelector(tag = "main")],
)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("test", "local")
class PactTest {

  @TestTemplate
  @ExtendWith(PactVerificationInvocationContextProvider::class)
  fun pactVerificationTestTemplate(context: PactVerificationContext) {
    context.verifyInteraction()
  }

  @State("a draft referral can be created")
  fun noop() {
  }

  @State("There is an existing draft referral with ID of ac386c25-52c8-41fa-9213-fcf42e24b0b5")
  fun `use referral ac386c25 from the seed`() {
  }

  @State("a draft referral with ID dfb64747-f658-40e0-a827-87b4b0bdcfed exists")
  fun `use referral dfb64747 from the seed`() {
  }
}
