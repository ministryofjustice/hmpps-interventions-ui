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
    update.completionDeadline?.let {
      referral.completionDeadline = it
    }

    return repository.save(referral)
  }

  fun getDraftReferralsCreatedByUserID(userID: String): List<DraftReferralDTO> {
    return repository.findByCreatedByUserID(userID).map { DraftReferralDTO.from(it) }
  }
}
