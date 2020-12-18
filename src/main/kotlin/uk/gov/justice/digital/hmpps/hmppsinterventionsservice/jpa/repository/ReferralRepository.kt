package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.repository.CrudRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.util.UUID

interface ReferralRepository : CrudRepository<Referral, UUID> {
  fun findByCreatedByUserID(userId: String): List<Referral>
}
