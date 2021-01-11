package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration

import au.com.dius.pact.provider.junit5.PactVerificationContext
import au.com.dius.pact.provider.junitsupport.Provider
import au.com.dius.pact.provider.junitsupport.State
import au.com.dius.pact.provider.junitsupport.loader.PactBroker
import au.com.dius.pact.provider.spring.junit5.PactVerificationSpringProvider
import org.junit.jupiter.api.Disabled
import org.junit.jupiter.api.TestTemplate
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit.jupiter.SpringExtension

@Disabled
@ExtendWith(SpringExtension::class)
@Provider("Interventions Service")
@PactBroker
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("test", "local")
class PactTest {

  @TestTemplate
  @ExtendWith(PactVerificationSpringProvider::class)
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
  fun `use service category 428ee70f from the seed`() {
  }

  @State("There is an existing draft referral with ID of d496e4a7-7cc1-44ea-ba67-c295084f1962, and it has had a service category selected")
  fun `use referral d496e4a7 from the seed`() {
  }
}
