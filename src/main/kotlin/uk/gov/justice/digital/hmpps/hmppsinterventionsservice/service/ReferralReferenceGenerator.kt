package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Component

@Component
class ReferralReferenceGenerator {
  private val prefixChars = ('A'..'Z').toList()
  private val numbers = ('0'..'9').toList()

  fun generate(categoryName: String): String {
    return buildString {
      append(prefix())
      append(numbers())
      append(categoryName.take(2))
    }.toUpperCase()
  }

  private fun prefix(): String = buildString { while (length < 2) append(prefixChars.random()) }
  private fun numbers(): String = buildString { while (length < 4) append(numbers.random()) }
}
