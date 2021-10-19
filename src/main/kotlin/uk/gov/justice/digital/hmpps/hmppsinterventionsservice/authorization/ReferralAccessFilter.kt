package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.data.jpa.domain.Specification
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProviderSentReferralSummary
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.specification.ReferralSpecifications
import java.util.UUID

@Component
class ReferralAccessFilter(
  private val serviceProviderAccessScopeMapper: ServiceProviderAccessScopeMapper,
) {
  fun serviceProviderReferrals(referrals: List<Referral>, user: AuthUser): List<Referral> {
    val userScope = serviceProviderAccessScopeMapper.fromUser(user)

    // fixme: how do equality operators work for these types of comparisons - should we write a custom equals override
    //        that compares contract reference numbers?
    return referrals.filter { userScope.contracts.contains(it.intervention.dynamicFrameworkContract) }
  }

  fun serviceProviderReferrals(referralSpec: Specification<Referral>, user: AuthUser): Specification<Referral> {
    val userScope = serviceProviderAccessScopeMapper.fromUser(user)
    return referralSpec.and(ReferralSpecifications.withSPAccess(userScope.contracts))
  }

  fun serviceProviderReferralSummaries(referrals: List<ServiceProviderSentReferralSummary>, user: AuthUser): List<ServiceProviderSentReferralSummary> {
    val userScope = serviceProviderAccessScopeMapper.fromUser(user)
    return referrals.filter { userScope.contracts.map { contract -> contract.id }.contains(UUID.fromString(it.dynamicFrameWorkContractId)) }
  }

  fun probationPractitionerReferrals(referrals: List<Referral>, user: AuthUser): List<Referral> {
    // todo: filter out referrals for limited access offenders (LAOs)
    return referrals
  }

  fun probationPractitionerReferrals(referralSpec: Specification<Referral>, user: AuthUser): Specification<Referral> {
    // todo: filter out referrals for limited access offenders (LAOs)
    return referralSpec
  }
}
