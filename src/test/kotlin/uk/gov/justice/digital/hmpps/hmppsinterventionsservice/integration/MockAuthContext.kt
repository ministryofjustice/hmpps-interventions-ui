package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.integration

import com.nhaarman.mockitokotlin2.mock
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService

@TestConfiguration
class MockAuthContext {
  @Bean
  @Primary
  fun hmppsAuthService(): HMPPSAuthService {
    return mock()
  }
}
