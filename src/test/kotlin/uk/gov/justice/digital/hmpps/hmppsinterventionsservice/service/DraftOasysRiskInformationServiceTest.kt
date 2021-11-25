package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftOasysRiskInformationDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DraftOasysRiskInformation
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DraftOasysRiskInformationRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import java.time.OffsetDateTime
import java.util.UUID

@RepositoryTest
class DraftOasysRiskInformationServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val draftOasysRiskInformationRepository: DraftOasysRiskInformationRepository,
  val authUserRepository: AuthUserRepository
) {

  private val referralFactory = ReferralFactory(entityManager)
  private val authUserFactory = AuthUserFactory(entityManager)
  private val draftOasysRiskInformationService = DraftOasysRiskInformationService(
    draftOasysRiskInformationRepository, authUserRepository
  )

  @Nested
  inner class UpdateDraftOasysRiskInformation {
    @Test
    fun `can save oasys risk information`() {
      val referral = referralFactory.createDraft()
      val user = authUserFactory.createSP()
      val oasysRiskInformationDTO = DraftOasysRiskInformationDTO(
        riskSummaryWhoIsAtRisk = "riskSummaryWhoIsAtRisk",
        riskSummaryNatureOfRisk = "riskSummaryNatureOfRisk",
        riskSummaryRiskImminence = "riskSummaryRiskImminence",
        riskToSelfSuicide = "riskToSelfSuicide",
        riskToSelfSelfHarm = "riskToSelfSelfHarm",
        riskToSelfHostelSetting = "riskToSelfHostelSetting",
        riskToSelfVulnerability = "riskToSelfVulnerability",
        additionalInformation = "additionalInformation",
      )
      val oasysRiskInformation = draftOasysRiskInformationService.updateDraftOasysRiskInformation(referral, oasysRiskInformationDTO, user)
      Assertions.assertThat(oasysRiskInformation.referralId).isEqualTo(referral.id)
      Assertions.assertThat(oasysRiskInformation.updatedAt).isBefore(OffsetDateTime.now())
      Assertions.assertThat(oasysRiskInformation.updatedBy).isEqualTo(user)
      Assertions.assertThat(oasysRiskInformation.additionalInformation).isEqualTo(oasysRiskInformationDTO.additionalInformation)
      Assertions.assertThat(oasysRiskInformation.riskSummaryWhoIsAtRisk).isEqualTo(oasysRiskInformationDTO.riskSummaryWhoIsAtRisk)
      Assertions.assertThat(oasysRiskInformation.riskSummaryNatureOfRisk).isEqualTo(oasysRiskInformationDTO.riskSummaryNatureOfRisk)
      Assertions.assertThat(oasysRiskInformation.riskSummaryRiskImminence).isEqualTo(oasysRiskInformationDTO.riskSummaryRiskImminence)
      Assertions.assertThat(oasysRiskInformation.riskToSelfSuicide).isEqualTo(oasysRiskInformationDTO.riskToSelfSuicide)
      Assertions.assertThat(oasysRiskInformation.riskToSelfSelfHarm).isEqualTo(oasysRiskInformationDTO.riskToSelfSelfHarm)
      Assertions.assertThat(oasysRiskInformation.riskToSelfHostelSetting).isEqualTo(oasysRiskInformationDTO.riskToSelfHostelSetting)
      Assertions.assertThat(oasysRiskInformation.riskToSelfVulnerability).isEqualTo(oasysRiskInformationDTO.riskToSelfVulnerability)
      Assertions.assertThat(oasysRiskInformation.additionalInformation).isEqualTo(oasysRiskInformationDTO.additionalInformation)
    }

    @Test
    fun `can overwrite oasys risk information`() {
      val referral = referralFactory.createDraft()
      val spUser = authUserFactory.createSP()
      val ppUser = authUserFactory.createPP()
      val oasysRiskInformation = DraftOasysRiskInformation(
        referralId = referral.id,
        updatedAt = OffsetDateTime.now(),
        updatedBy = spUser,
        riskSummaryWhoIsAtRisk = "riskSummaryWhoIsAtRisk",
        riskSummaryNatureOfRisk = "riskSummaryNatureOfRisk",
        riskSummaryRiskImminence = "riskSummaryRiskImminence",
        riskToSelfSuicide = "riskToSelfSuicide",
        riskToSelfSelfHarm = "riskToSelfSelfHarm",
        riskToSelfHostelSetting = "riskToSelfHostelSetting",
        riskToSelfVulnerability = "riskToSelfVulnerability",
        additionalInformation = "additionalInformation",
      )
      draftOasysRiskInformationRepository.save(oasysRiskInformation)
      val oasysRiskInformationDTO = DraftOasysRiskInformationDTO(
        riskSummaryWhoIsAtRisk = "riskSummaryWhoIsAtRiskModified",
        riskSummaryNatureOfRisk = "riskSummaryNatureOfRiskModified",
        riskSummaryRiskImminence = "riskSummaryRiskImminenceModified",
        riskToSelfSuicide = "riskToSelfSuicideModified",
        riskToSelfSelfHarm = "riskToSelfSelfHarmModified",
        riskToSelfHostelSetting = "riskToSelfHostelSettingModified",
        riskToSelfVulnerability = "riskToSelfVulnerabilityModified",
        additionalInformation = "additionalInformationModified",
      )
      val entity = draftOasysRiskInformationService.updateDraftOasysRiskInformation(referral, oasysRiskInformationDTO, ppUser)
      Assertions.assertThat(entity.referralId).isEqualTo(referral.id)
      Assertions.assertThat(entity.updatedAt).isAfter(oasysRiskInformation.updatedAt)
      Assertions.assertThat(entity.updatedBy).isEqualTo(ppUser)
      Assertions.assertThat(entity.riskSummaryWhoIsAtRisk).isEqualTo(oasysRiskInformationDTO.riskSummaryWhoIsAtRisk)
      Assertions.assertThat(entity.riskSummaryNatureOfRisk).isEqualTo(oasysRiskInformationDTO.riskSummaryNatureOfRisk)
      Assertions.assertThat(entity.riskSummaryRiskImminence).isEqualTo(oasysRiskInformationDTO.riskSummaryRiskImminence)
      Assertions.assertThat(entity.riskToSelfSuicide).isEqualTo(oasysRiskInformationDTO.riskToSelfSuicide)
      Assertions.assertThat(entity.riskToSelfSelfHarm).isEqualTo(oasysRiskInformationDTO.riskToSelfSelfHarm)
      Assertions.assertThat(entity.riskToSelfHostelSetting).isEqualTo(oasysRiskInformationDTO.riskToSelfHostelSetting)
      Assertions.assertThat(entity.riskToSelfVulnerability).isEqualTo(oasysRiskInformationDTO.riskToSelfVulnerability)
      Assertions.assertThat(entity.additionalInformation).isEqualTo(oasysRiskInformationDTO.additionalInformation)
    }
  }
  @Nested
  inner class GetDraftOasysRiskInformation {
    @Test
    fun `can get oasys risk information`() {
      val referral = referralFactory.createDraft()
      val user = authUserFactory.createSP()
      val oasysRiskInformation = DraftOasysRiskInformation(
        referralId = referral.id,
        updatedAt = OffsetDateTime.now(),
        updatedBy = user,
        riskSummaryWhoIsAtRisk = "riskSummaryWhoIsAtRisk",
        riskSummaryNatureOfRisk = "riskSummaryNatureOfRisk",
        riskSummaryRiskImminence = "riskSummaryRiskImminence",
        riskToSelfSuicide = "riskToSelfSuicide",
        riskToSelfSelfHarm = "riskToSelfSelfHarm",
        riskToSelfHostelSetting = "riskToSelfHostelSetting",
        riskToSelfVulnerability = "riskToSelfVulnerability",
        additionalInformation = "additionalInformationModified",
      )
      draftOasysRiskInformationRepository.save(oasysRiskInformation)
      val entity = draftOasysRiskInformationService.getDraftOasysRiskInformation(referral.id)
      Assertions.assertThat(entity).isNotNull
    }

    @Test
    fun `return null if no oasys risk information exists`() {
      val entity = draftOasysRiskInformationService.getDraftOasysRiskInformation(UUID.randomUUID())
      Assertions.assertThat(entity).isNull()
    }
  }

  @Nested
  inner class DeleteDraftOasysRiskInformation {
    @Test
    fun `can delete oasys risk information`() {
      val referral = referralFactory.createDraft()
      val user = authUserFactory.createSP()
      val oasysRiskInformation = DraftOasysRiskInformation(
        referralId = referral.id,
        updatedAt = OffsetDateTime.now(),
        updatedBy = user,
        riskSummaryWhoIsAtRisk = "riskSummaryWhoIsAtRisk",
        riskSummaryNatureOfRisk = "riskSummaryNatureOfRisk",
        riskSummaryRiskImminence = "riskSummaryRiskImminence",
        riskToSelfSuicide = "riskToSelfSuicide",
        riskToSelfSelfHarm = "riskToSelfSelfHarm",
        riskToSelfHostelSetting = "riskToSelfHostelSetting",
        riskToSelfVulnerability = "riskToSelfVulnerability",
        additionalInformation = "additionalInformationModified",
      )
      draftOasysRiskInformationRepository.save(oasysRiskInformation)
      draftOasysRiskInformationService.deleteDraftOasysRiskInformation(referral.id)
      val entity = draftOasysRiskInformationService.getDraftOasysRiskInformation(referral.id)
      Assertions.assertThat(entity).isNull()
    }

    @Test
    fun `deleting non-existing oasys risk information is noop`() {
      val referral = referralFactory.createDraft()
      draftOasysRiskInformationService.deleteDraftOasysRiskInformation(referral.id)
    }
  }
}
