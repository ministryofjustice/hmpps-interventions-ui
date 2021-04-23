package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

data class EndReferralDTO(
  val cancellationReasonCode: String,
  val cancellationComments: String?,
)
