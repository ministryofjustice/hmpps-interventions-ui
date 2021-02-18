package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class ReferralReferenceGeneratorTest {
  private val generator = ReferralReferenceGenerator()

  @Test
  fun `generates 2-letter 4-digit 2-letter references`() {
    repeat(5) {
      assertThat(generator.generate("name")).matches("[A-Z]{2}[0-9]{4}[A-Z]{2}")
    }
  }

  @Test
  fun `reference postfix is the capitalised first two (unicode) letters of the given category`() {
    assertThat(generator.generate("Category")).endsWith("CA")
    assertThat(generator.generate("accommodation")).endsWith("AC")
    assertThat(generator.generate("űrlény")).endsWith("ŰR")
  }
}
