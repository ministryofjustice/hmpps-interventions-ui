package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DraftOasysRiskInformation

data class DraftOasysRiskInformationDTO(
  val riskSummaryWhoIsAtRisk: String?,
  val riskSummaryNatureOfRisk: String?,
  val riskSummaryRiskImminence: String?,
  val riskToSelfSuicide: String?,
  val riskToSelfSelfHarm: String?,
  val riskToSelfHostelSetting: String?,
  val riskToSelfVulnerability: String?,
  val additionalInformation: String?,
) {
  companion object {
    fun from(draftOasysRiskInformation: DraftOasysRiskInformation): DraftOasysRiskInformationDTO {
      return DraftOasysRiskInformationDTO(
        riskSummaryWhoIsAtRisk = draftOasysRiskInformation.riskSummaryWhoIsAtRisk,
        riskSummaryNatureOfRisk = draftOasysRiskInformation.riskSummaryNatureOfRisk,
        riskSummaryRiskImminence = draftOasysRiskInformation.riskSummaryRiskImminence,
        riskToSelfSuicide = draftOasysRiskInformation.riskToSelfSuicide,
        riskToSelfSelfHarm = draftOasysRiskInformation.riskToSelfSelfHarm,
        riskToSelfHostelSetting = draftOasysRiskInformation.riskToSelfHostelSetting,
        riskToSelfVulnerability = draftOasysRiskInformation.riskToSelfVulnerability,
        additionalInformation = draftOasysRiskInformation.additionalInformation,
      )
    }
  }
}
