package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

data class UpdateEndOfServiceReportDTO(
  val furtherInformation: String?,
  val outcome: CreateEndOfServiceReportOutcomeDTO?
)
