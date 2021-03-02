package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

data class UpdateActionPlanDTO(
  val numberOfSessions: Int?,
  val activity: CreateActionPlanActivityDTO?
)
