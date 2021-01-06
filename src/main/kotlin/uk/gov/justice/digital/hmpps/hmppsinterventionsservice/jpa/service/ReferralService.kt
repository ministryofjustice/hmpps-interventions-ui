package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.util.UUID

@Service
class ReferralService(val repository: ReferralRepository) {
  fun createDraftReferral(): Referral {
    return repository.save(Referral())
  }

  fun getDraftReferral(id: UUID): Referral? {
    return repository.findByIdOrNull(id)
  }

  fun updateDraftReferral(referral: Referral, update: DraftReferralDTO): Referral {
    update.serviceCategoryId?.let {
      // fixme: error if service category is already set
      referral.serviceCategoryID = it
    }

    update.completionDeadline?.let {
      // fixme: error if completion deadline is after sentence end date
      referral.completionDeadline = it
    }

    update.complexityLevelId?.let {
      // fixme: error if service category not set for referral
      //        error if complexity level not valid for service category
      referral.complexityLevelID = it
    }

    update.furtherInformation?.let {
      referral.furtherInformation = it
    }

    update.additionalNeedsInformation?.let {
      referral.additionalNeedsInformation = it
    }

    update.accessibilityNeeds?.let {
      referral.accessibilityNeeds = it
    }

    update.needsInterpreter?.let {
      // fixme: error if this is true and interpreterLangyage is missing
      referral.needsInterpreter = it
    }

    update.interpreterLanguage?.let {
      referral.interpreterLanguage = it
    }

    update.hasAdditionalResponsibilities?.let {
      // fixme: error if this is true and whenUnavailable is missing
      referral.hasAdditionalResponsibilities = it
    }

    update.whenUnavailable?.let {
      referral.whenUnavailable = it
    }

    update.additionalRiskInformation?.let {
      referral.additionalRiskInformation = it
    }

    return repository.save(referral)
  }

  fun getDraftReferralsCreatedByUserID(userID: String): List<DraftReferralDTO> {
    return repository.findByCreatedByUserID(userID).map { DraftReferralDTO.from(it) }
  }
}
