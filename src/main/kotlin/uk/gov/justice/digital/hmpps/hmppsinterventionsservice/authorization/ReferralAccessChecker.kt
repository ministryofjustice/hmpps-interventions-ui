package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

@Component
class ReferralAccessChecker(
  private val userTypeChecker: UserTypeChecker,
  private val eligibleProviderMapper: EligibleProviderMapper,
  private val userAccessScopeMapper: UserAccessScopeMapper,
) {
  fun forServiceProviderUser(referral: Referral, user: AuthUser): Boolean {
    if (!userTypeChecker.isServiceProviderUser(user)) {
      return false
    }

    val userScope = userAccessScopeMapper.forServiceProviderUser(user)
    val eligibleServiceProviders = eligibleProviderMapper.fromReferral(referral)

    if (!eligibleServiceProviders.contains(userScope.serviceProvider)) {
      return false
    }

    if (!userScope.contracts.contains(referral.intervention.dynamicFrameworkContract)) {
      return false
    }

    return true
  }
}
