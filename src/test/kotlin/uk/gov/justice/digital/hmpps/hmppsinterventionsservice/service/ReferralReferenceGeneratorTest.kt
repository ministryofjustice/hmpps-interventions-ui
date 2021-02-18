package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ReferralReferenceGeneratorTest {
  private val generator = ReferralReferenceGenerator()

  @Test
  fun `generates the same reference number every time`() {
    for (i in 1..5) {
      assertThat(generator.generate()).isEqualTo("HDJ2123F")
    }
  }
}
