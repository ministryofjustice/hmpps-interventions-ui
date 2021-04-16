package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason

data class CancellationReasonsDTO(
  val cancellationReasons: List<CancellationReason>
) {
  companion object {
    fun from(reasons: List<CancellationReason>): CancellationReasonsDTO {
      return CancellationReasonsDTO(
        cancellationReasons = reasons
      )
    }
  }
}
