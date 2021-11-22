package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DraftOasysRiskInformation
import java.time.OffsetDateTime
import java.util.UUID

class DraftOasysRiskInformationFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val authUserFactory = AuthUserFactory(em)
  fun create(
    referralId: UUID,
    updatedAt: OffsetDateTime = OffsetDateTime.now(),
    updatedBy: AuthUser = authUserFactory.create(),
    riskSummaryWhoIsAtRisk: String?,
    riskSummaryNatureOfRisk: String?,
    riskSummaryRiskImminence: String?,
    riskToSelfSuicide: String?,
    riskToSelfSelfHarm: String?,
    riskToSelfHostelSetting: String?,
    riskToSelfVulnerability: String?,
    additionalInformation: String?,
  ): DraftOasysRiskInformation {
    return save(
      DraftOasysRiskInformation(
        referralId,
        updatedAt,
        updatedBy,
        riskSummaryWhoIsAtRisk,
        riskSummaryNatureOfRisk,
        riskSummaryRiskImminence,
        riskToSelfSuicide,
        riskToSelfSelfHarm,
        riskToSelfHostelSetting,
        riskToSelfVulnerability,
        additionalInformation,
      )
    )
  }
}
