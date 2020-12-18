package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferral
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

  fun updateDraftReferral(id: UUID, update: DraftReferral): Referral? {
    val ref = getDraftReferral(id) ?: return null

    update.completionDeadline?.let {
      ref.completionDeadline = update.completionDeadline
      return repository.save(ref)
    }
    return ref
  }

  fun getDraftReferralsCreatedByUserID(userID: String): List<DraftReferral> {
    return repository.findByCreatedByUserID(userID).map { DraftReferral(it) }
  }
}
