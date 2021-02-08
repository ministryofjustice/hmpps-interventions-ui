package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import java.util.UUID

data class CreateReferralRequestDTO(
  val serviceUserCrn: String,
  val interventionId: UUID,
)
