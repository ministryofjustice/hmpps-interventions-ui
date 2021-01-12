package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration

import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.State
import au.com.dius.pact.provider.junitsupport.loader.PactBroker
import au.com.dius.pact.provider.junitsupport.loader.VersionSelector
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles

//@Disabled
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

  @State("a service category with ID 428ee70f-3001-4399-95a6-ad25eaaede16 exists")
  fun `use service category 428ee70f from the seed`() {}

  @State("There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected")
  fun `use referral d496e4a7 from the seed`() {}

  @State("There is an existing draft referral with ID of 037cc90b-beaa-4a32-9ab7-7f79136e1d27, and it has had desired outcomes selected")
  fun `tmp`() {}

  @State("There is an existing draft referral with ID of 1219a064-709b-4b6c-a11e-10b8cb3966f6, and it has had a service user selected")
  fun `tmp2`() {}

  @State("a referral for user with ID 2500128586 exists")
  fun `tmp3`() {}

  @State("a referral does not exist for user with ID 123344556")
  fun `tmp4`() {}
}
