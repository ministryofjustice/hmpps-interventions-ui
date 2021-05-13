package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

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

  fun probationPractitionerReferrals(referrals: List<Referral>, user: AuthUser): List<Referral> {
    // todo: filter out referrals for limited access offenders (LAOs)
    return referrals
  }
}
