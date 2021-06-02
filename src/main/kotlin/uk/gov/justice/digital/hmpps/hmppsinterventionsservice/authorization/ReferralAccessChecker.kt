package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.AccessError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CommunityAPIOffenderService

@Component
class ReferralAccessChecker(
  private val userTypeChecker: UserTypeChecker,
  private val eligibleProviderMapper: EligibleProviderMapper,
  private val serviceProviderAccessScopeMapper: ServiceProviderAccessScopeMapper,
  private val communityApiOffenderService: CommunityAPIOffenderService,
) {
  private val errorMessage = "user does not have access to referral"

  fun forUser(referral: Referral, user: AuthUser, authentication: JwtAuthenticationToken) {
    when {
      userTypeChecker.isProbationPractitionerUser(user) -> forProbationPractitionerUser(referral, user, authentication)
      userTypeChecker.isServiceProviderUser(user) -> forServiceProviderUser(referral, user)
      else -> throw AccessError(errorMessage, listOf("invalid user type"))
    }
  }

  private fun forServiceProviderUser(referral: Referral, user: AuthUser) {
    val userScope = serviceProviderAccessScopeMapper.fromUser(user)
    val eligibleServiceProviders = eligibleProviderMapper.fromReferral(referral)
    val errors = mutableListOf<String>()

    if (!eligibleServiceProviders.contains(userScope.serviceProvider)) {
      errors.add("user's organization is not eligible to access this referral")
    }

    if (!userScope.contracts.contains(referral.intervention.dynamicFrameworkContract)) {
      errors.add("user does not have the required contract group to access this referral")
    }

    if (errors.isNotEmpty()) {
      throw AccessError(errorMessage, errors)
    }
  }

  private fun forProbationPractitionerUser(referral: Referral, user: AuthUser, authentication: JwtAuthenticationToken) {
    val hasAccess = communityApiOffenderService.checkIfAuthenticatedDeliusUserHasAccessToOffender(authentication, referral.serviceUserCRN)
    if (!hasAccess) {
      throw AccessError(errorMessage, listOf("probation practitioner is excluded from access to this service user"))
    }
  }
}
