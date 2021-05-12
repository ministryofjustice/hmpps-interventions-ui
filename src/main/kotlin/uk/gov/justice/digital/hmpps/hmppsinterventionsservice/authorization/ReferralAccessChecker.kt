package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

class ReferralAccessChecker(
  private val userTypeChecker: UserTypeChecker,
  private val eligibleProviderMapper: EligibleProviderMapper,
  private val userAccessScopeMapper: UserAccessScopeMapper,
  private val userMapper: UserMapper,
) {
  fun forServiceProviderUser(token: JwtAuthenticationToken, referral: Referral): Boolean {
    val user = userMapper.fromToken(token)

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
