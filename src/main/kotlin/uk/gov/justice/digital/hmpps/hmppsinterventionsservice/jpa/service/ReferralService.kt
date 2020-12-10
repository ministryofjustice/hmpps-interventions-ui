package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

object ReferralService {
  fun updateReferral(original: Referral, update: DraftReferral): Referral {
    update.completionDeadline?.let { original.completionDeadline = it }
    return original
  }
}
