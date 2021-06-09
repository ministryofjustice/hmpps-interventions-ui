package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import java.util.UUID

interface ReferralRepository : JpaRepository<Referral, UUID> {
  // queries for service providers
  fun findAllByInterventionDynamicFrameworkContractPrimeProviderAndSentAtIsNotNull(provider: ServiceProvider): List<Referral>
  fun findAllByInterventionDynamicFrameworkContractSubcontractorProvidersAndSentAtIsNotNull(provider: ServiceProvider): List<Referral>

  // queries for sent referrals
  fun findByIdAndSentAtIsNotNull(id: UUID): Referral?
  fun findByCreatedByAndSentAtIsNotNull(user: AuthUser): List<Referral>
  fun existsByReferenceNumber(reference: String): Boolean
  fun findByServiceUserCRNAndSentAtIsNotNull(crn: String): List<Referral>

  // queries for draft referrals
  fun findByIdAndSentAtIsNull(id: UUID): Referral?
  fun findByCreatedByIdAndSentAtIsNull(userId: String): List<Referral>
}
