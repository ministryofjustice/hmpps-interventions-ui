package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftOasysRiskInformationDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DraftOasysRiskInformation
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DraftOasysRiskInformationRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional

@Service
@Transactional
class DraftOasysRiskInformationService(
  val draftOasysRiskInformationRepository: DraftOasysRiskInformationRepository,
  val authUserRepository: AuthUserRepository,
) {
  fun updateDraftOasysRiskInformation(referral: Referral, draftOasysRiskInformationDTO: DraftOasysRiskInformationDTO, user: AuthUser): DraftOasysRiskInformation {
    val draftOasysRiskInformation = DraftOasysRiskInformation(
      referralId = referral.id,
      updatedAt = OffsetDateTime.now(),
      updatedBy = authUserRepository.save(user),
      riskSummaryWhoIsAtRisk = draftOasysRiskInformationDTO.riskSummaryWhoIsAtRisk,
      riskSummaryNatureOfRisk = draftOasysRiskInformationDTO.riskSummaryNatureOfRisk,
      riskSummaryRiskImminence = draftOasysRiskInformationDTO.riskSummaryRiskImminence,
      riskToSelfSuicide = draftOasysRiskInformationDTO.riskToSelfSuicide,
      riskToSelfSelfHarm = draftOasysRiskInformationDTO.riskToSelfSelfHarm,
      riskToSelfHostelSetting = draftOasysRiskInformationDTO.riskToSelfHostelSetting,
      riskToSelfVulnerability = draftOasysRiskInformationDTO.riskToSelfVulnerability,
      additionalInformation = draftOasysRiskInformationDTO.additionalInformation,
    )
    return draftOasysRiskInformationRepository.save(draftOasysRiskInformation)
  }

  fun getDraftOasysRiskInformation(id: UUID): DraftOasysRiskInformation? {
    return draftOasysRiskInformationRepository.findByIdOrNull(id)
  }
}
