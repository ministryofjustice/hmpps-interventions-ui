package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

data class EndReferralRequestDTO(
  val reasonCode: String,
  val comments: String?,
)
