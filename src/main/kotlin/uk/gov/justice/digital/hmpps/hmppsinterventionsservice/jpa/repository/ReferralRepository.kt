package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.repository.CrudRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.util.UUID

interface ReferralRepository : CrudRepository<Referral, UUID> {
  // queries for sent referrals
  fun findByIdAndSentAtIsNotNull(id: UUID): Referral?
  fun findBySentAtIsNotNull(): List<Referral>
  fun findByInterventionDynamicFrameworkContractServiceProviderIdAndSentAtIsNotNull(id: AuthGroupID): List<Referral>
  fun existsByReferenceNumber(reference: String): Boolean

  // queries for draft referrals
  fun findByIdAndSentAtIsNull(id: UUID): Referral?
  fun findByCreatedByIdAndSentAtIsNull(userId: String): List<Referral>
}
