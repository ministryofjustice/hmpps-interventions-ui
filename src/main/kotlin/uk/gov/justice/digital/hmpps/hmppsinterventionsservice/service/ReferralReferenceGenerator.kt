package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.stereotype.Component

@Component
class ReferralReferenceGenerator(
  private val prefixChars: List<Char> = ('A'..'Z').toList().filterNot { it in listOf('I', 'O') },
  private val numbers: List<Char> = ('0'..'9').toList(),
) {
  private val ambiguousPairs = listOf(
    Pair("0", "O"),
    Pair("1", "I"),
    Pair("5", "S"),
    Pair("8", "B"),
  )

  fun generate(categoryName: String): String {
    return generateSequence { newReference(categoryName) }
      .filterNot { ambiguous(it) }
      .first()
  }

  private fun newReference(categoryName: String): String {
    return buildString {
      append(prefix())
      append(numbers())
      append(categoryName.take(2))
    }.toUpperCase()
  }

  private fun prefix(): String = buildString { while (length < 2) append(prefixChars.random()) }
  private fun numbers(): String = buildString { while (length < 4) append(numbers.random()) }

  private fun ambiguous(candidate: String): Boolean {
    return ambiguousPairs.any { pair -> candidate.contains(pair.first) && candidate.contains(pair.second) }
  }
}
