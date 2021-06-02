package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.AccessError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CommunityAPIOffenderService

@Component
class ServiceUserAccessChecker(
  private val communityApiOffenderService: CommunityAPIOffenderService,
) {
  private val errorMessage = "user is not allowed to access records related to this service user"

  fun forProbationPractitionerUser(crn: String, authentication: JwtAuthenticationToken) {
    val accessResult =
      communityApiOffenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(authentication, crn)
    if (!accessResult.canAccess) {
      throw AccessError(errorMessage, listOfNotNull(accessResult.exclusionMessage, accessResult.restrictionMessage))
    }
  }
}
