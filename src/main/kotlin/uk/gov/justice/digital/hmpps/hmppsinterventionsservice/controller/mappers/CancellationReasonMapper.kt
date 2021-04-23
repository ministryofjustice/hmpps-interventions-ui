package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CancellationReasonRepository

@Component
class CancellationReasonMapper(
  private val cancellationReasonRepository: CancellationReasonRepository
) {
  fun mapCancellationReasonIdToCancellationReason(cancellationReasonId: String): CancellationReason {
    return cancellationReasonRepository.findByIdOrNull(cancellationReasonId)
      ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid cancellation code. [code=$cancellationReasonId]")
  }
}
