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
  fun `references must avoid similar looking letters and numbers`() {
    data class Example(val prefixChars: String, val numbers: String, val doesNotContain: String)

    val examples = listOf(
      Example("O", "07", "0"),
      Example("I", "17", "1"),
      Example("S", "57", "5"),
      Example("B", "87", "8"),
      Example("OX", "0", "O"),
      Example("IX", "1", "I"),
      Example("SX", "5", "S"),
      Example("BX", "8", "B"),
    )

    examples.forEach { ex ->
      val g = ReferralReferenceGenerator(prefixChars = ex.prefixChars.toList(), numbers = ex.numbers.toList())
      assertThat(g.generate("name")).doesNotContain(
        ex.doesNotContain,
        "Characters in ${ex.prefixChars} and ${ex.numbers} are similar, avoid '${ex.doesNotContain}' to remain unambiguous"
      )
    }
  }

  @Test
  fun `reference postfix is the capitalised first two (unicode) letters of the given category`() {
    assertThat(generator.generate("Category")).endsWith("CA")
    assertThat(generator.generate("accommodation")).endsWith("AC")
    assertThat(generator.generate("űrlény")).endsWith("ŰR")
  }
}
