package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CommunityAPIOffenderService

@Component
class ServiceUserAccessChecker(
  private val communityApiOffenderService: CommunityAPIOffenderService,
) {
  private val errorMessage = "user is not allowed to access records related to this service user"

  fun forProbationPractitionerUser(crn: String, user: AuthUser) {
    // FIXME: the community API user access integration is currently not functioning properly;
    // the response always appears to grant access, regardless of the exclusions / restrictions.
    // this code is commented out so it's clear there is no access check happening.

    // val accessResult =
    //   communityApiOffenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(user, crn)
    // if (!accessResult.canAccess) {
    //   throw AccessError(errorMessage, accessResult.messages)
    // }
  }
}
