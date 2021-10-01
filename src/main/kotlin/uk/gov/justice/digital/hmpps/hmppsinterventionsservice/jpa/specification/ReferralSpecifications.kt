package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.specification

import org.springframework.data.jpa.domain.Specification
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.criteria.JoinType

class ReferralSpecifications {
  companion object {

    fun sent(): Specification<Referral> {
      return Specification<Referral> { root, query, cb ->
        cb.isNotNull(root.get<OffsetDateTime>("sentAt"))
      }
    }

    fun concluded(): Specification<Referral> {
      return Specification<Referral> { root, query, cb ->
        cb.isNotNull(root.get<OffsetDateTime>("concludedAt"))
      }
    }

    fun unassigned(): Specification<Referral> {
      return Specification<Referral> { root, query, cb ->
        cb.isEmpty(root.get<List<ReferralAssignment>>("assignments"))
      }
    }

    /**
     * This cancellation logic is duplicated from Referral.kt. We have to duplicate it because the logic within the
     * entity is not accessible via JPQL.
     * The official definition of cancelled referral is where the referral is concluded and no session was attended;
     * however, the logic below is a proxy for the same thing since only cancelled referrals have null EOSR from the
     * ReferralConcluder.kt class.
     */
    fun cancelled(): Specification<Referral> {
      return Specification<Referral> { root, query, cb ->
        cb.and(
          cb.isNotNull(root.get<OffsetDateTime>("endRequestedAt")),
          cb.isNotNull(root.get<OffsetDateTime>("concludedAt")),
          root.join<Referral, EndOfServiceReport>("endOfServiceReport", JoinType.LEFT).isNull
        )
      }
    }

    fun withSPAccess(contracts: Set<DynamicFrameworkContract>): Specification<Referral> {
      return Specification<Referral> { root, query, cb ->
        val interventionJoin = root.join<Referral, Intervention>("intervention", JoinType.INNER)
        val dynamicContractJoin = interventionJoin.join<Intervention, DynamicFrameworkContract>("dynamicFrameworkContract", JoinType.LEFT)
        dynamicContractJoin.`in`(contracts)
      }
    }

    fun matchingPrimeProviderReferrals(serviceProviders: Set<ServiceProvider>): Specification<Referral> {
      return Specification<Referral> { root, query, cb ->
        val interventionJoin = root.join<Referral, Intervention>("intervention", JoinType.INNER)
        val dynamicContractJoin = interventionJoin.join<Intervention, DynamicFrameworkContract>("dynamicFrameworkContract", JoinType.LEFT)
        query.distinct(true)
        dynamicContractJoin.get<ServiceProvider>("primeProvider").`in`(serviceProviders)
      }
    }

    fun matchingSubContractorReferrals(serviceProviders: Set<ServiceProvider>): Specification<Referral> {
      return Specification<Referral> { root, query, cb ->
        val interventionJoin = root.join<Referral, Intervention>("intervention", JoinType.INNER)
        val dynamicContractJoin = interventionJoin.join<Intervention, DynamicFrameworkContract>("dynamicFrameworkContract", JoinType.INNER)
        val serviceProviderJoin = dynamicContractJoin.joinSet<DynamicFrameworkContract, ServiceProvider>("subcontractorProviders", JoinType.LEFT)
        query.distinct(true)
        serviceProviderJoin.get<AuthGroupID>("id").`in`(serviceProviders.map { it.id })
      }
    }

    fun createdBy(authUser: AuthUser): Specification<Referral> {
      return Specification<Referral> { root, query, cb -> cb.equal(root.get<String>("createdBy"), authUser) }
    }

    fun matchingServiceUserReferrals(serviceUserCRNs: List<String>): Specification<Referral> {
      return Specification<Referral> { root, query, cb -> root.get<String>("serviceUserCRN").`in`(serviceUserCRNs) }
    }

    /**
     * This is performing the equivalent of:
     *
     * SELECT r FROM referral r
     * inner join referral_assignments ra
     *    inner join auth_user au on ra.assigned_to_id = au.id
     *  on ra.referral_id = r.id
     * where ra.assigned_at = (SELECT MAX(assigned_at) FROM referral_assignments WHERE referral_id = ra.referral_id)
     * and au.id = $USER_ID
     */
    fun currentlyAssignedTo(authUserId: String): Specification<Referral> {
      return Specification<Referral> { root, query, cb ->
        // INNER JOIN
        val referralAssignmentJoin = root.join<Referral, ReferralAssignment>("assignments", JoinType.INNER)

        // WHERE assigned_at = max(assigned_at)
        val subquery = query.subquery(OffsetDateTime::class.java)
        val subQueryReferral = subquery.from(Referral::class.java)
        val subQueryReferralAssignmentJoin = subQueryReferral.join<Referral, ReferralAssignment>("assignments", JoinType.INNER)
        val maxAssignedAt = cb.greatest(subQueryReferralAssignmentJoin.get<OffsetDateTime>("assignedAt"))
        subquery.select(maxAssignedAt)
        subquery.where(cb.equal(root.get<UUID>("id"), subQueryReferral.get<UUID>("id")))
        val maxAssignedAtMatch = cb.equal(referralAssignmentJoin.get<OffsetDateTime>("assignedAt"), subquery)

        // AND assigned_to = authUser
        val authUserJoin = referralAssignmentJoin.join<ReferralAssignment, AuthUser>("assignedTo", JoinType.LEFT)
        cb.and(maxAssignedAtMatch, cb.equal(authUserJoin.get<String>("id"), authUserId))
      }
    }
  }
}
