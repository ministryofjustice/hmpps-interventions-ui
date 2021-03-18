package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateEndOfServiceReportOutcomeDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReportOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DesiredOutcomeRepository

@Component
class EndOfServiceReportOutcomeMapper(
  private val desiredOutcomeRepository: DesiredOutcomeRepository,
) {
  fun mapCreateEndOfServiceReportOutcomeDtoToEndOfServiceReportOutcome(outcome: CreateEndOfServiceReportOutcomeDTO):
    EndOfServiceReportOutcome {
      return EndOfServiceReportOutcome(
        desiredOutcome = desiredOutcomeRepository.findById(outcome.desiredOutcomeId).orElseThrow {
          throw ResponseStatusException(HttpStatus.NOT_FOUND, "desired outcome not found [id=${outcome.desiredOutcomeId}]")
        },
        achievementLevel = outcome.achievementLevel,
        progressionComments = outcome.progressionComments,
        additionalTaskComments = outcome.additionalTaskComments,
      )
    }
}
