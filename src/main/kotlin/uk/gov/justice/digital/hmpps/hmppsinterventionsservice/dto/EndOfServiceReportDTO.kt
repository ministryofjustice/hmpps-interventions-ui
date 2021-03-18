package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AchievementLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReportOutcome
import java.time.OffsetDateTime
import java.util.UUID

data class EndOfServiceReportDTO(
  val id: UUID,
  val createdAt: OffsetDateTime,
  val createdBy: AuthUserDTO,
  val submittedAt: OffsetDateTime? = null,
  val submittedBy: AuthUserDTO? = null,
  val furtherInformation: String? = null,
  val outcomes: Set<EndOfServiceReportOutcomeDTO> = emptySet(),
) {
  companion object {
    fun from(endOfServiceReport: EndOfServiceReport): EndOfServiceReportDTO {
      return EndOfServiceReportDTO(
        id = endOfServiceReport.id,
        createdAt = endOfServiceReport.createdAt,
        createdBy = AuthUserDTO.from(endOfServiceReport.createdBy),
        submittedAt = endOfServiceReport.submittedAt,
        submittedBy = endOfServiceReport.submittedBy?.let { AuthUserDTO.from(it) },
        furtherInformation = endOfServiceReport.furtherInformation,
        outcomes = endOfServiceReport.outcomes.map { EndOfServiceReportOutcomeDTO.from(it) }.toMutableSet(),
      )
    }
  }
}
data class EndOfServiceReportOutcomeDTO(
  val desiredOutcome: DesiredOutcomeDTO,
  val achievementLevel: AchievementLevel,
  val progressionComments: String? = null,
  val additionalTaskComments: String? = null
) {
  companion object {
    fun from(endOfServiceReportOutcome: EndOfServiceReportOutcome): EndOfServiceReportOutcomeDTO {
      return EndOfServiceReportOutcomeDTO(
        desiredOutcome = DesiredOutcomeDTO.from(endOfServiceReportOutcome.desiredOutcome),
        achievementLevel = endOfServiceReportOutcome.achievementLevel,
        progressionComments = endOfServiceReportOutcome.progressionComments,
        additionalTaskComments = endOfServiceReportOutcome.additionalTaskComments
      )
    }
  }
}
