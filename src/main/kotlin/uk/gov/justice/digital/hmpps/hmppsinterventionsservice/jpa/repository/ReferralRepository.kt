package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

interface ReferralRepository : JpaRepository<Referral, UUID>, JpaSpecificationExecutor<Referral>, ReferralSummaryRepository {
  // queries for sent referrals
  fun findByIdAndSentAtIsNotNull(id: UUID): Referral?
  fun existsByReferenceNumber(reference: String): Boolean

  // queries for draft referrals
  fun findByIdAndSentAtIsNull(id: UUID): Referral?
  fun findByCreatedByIdAndSentAtIsNull(userId: String): List<Referral>

  // queries for reporting
  @Query("select r from Referral r where r.sentAt > :from and r.sentAt < :to and r.intervention.dynamicFrameworkContract in :contracts")
  fun serviceProviderReportReferrals(from: OffsetDateTime, to: OffsetDateTime, contracts: Set<DynamicFrameworkContract>, pageable: Pageable): Page<Referral>
}
