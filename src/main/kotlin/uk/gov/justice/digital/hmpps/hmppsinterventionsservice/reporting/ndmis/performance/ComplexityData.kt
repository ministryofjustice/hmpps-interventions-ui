package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import java.util.UUID

data class ComplexityData(
  val referralReference: String,
  val referralId: UUID,
  val interventionTitle: String,
  val serviceCategoryId: UUID,
  val serviceCategoryName: String,
  val complexityLevelTitle: String,
) {
  companion object {
    val fields = listOf(
      "referralReference",
      "referralId",
      "interventionTitle",
      "serviceCategoryId",
      "serviceCategoryName",
      "complexityLevelTitle",
    )
    val headers = listOf(
      "referral_ref",
      "referral_id",
      "intervention_title",
      "service_category_id",
      "service_category_name",
      "complexity_level_title",
    )
  }
}
