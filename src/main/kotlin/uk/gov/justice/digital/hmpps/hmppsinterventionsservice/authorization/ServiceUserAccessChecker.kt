package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.AccessError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CommunityAPIOffenderService

@Component
class ServiceUserAccessChecker(
  private val communityApiOffenderService: CommunityAPIOffenderService,
) {
  private val errorMessage = "user is not allowed to access records related to this service user"

  fun forProbationPractitionerUser(crn: String, user: AuthUser) {
    val accessResult =
      communityApiOffenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(user, crn)
    if (!accessResult.canAccess) {
      throw AccessError(user, errorMessage, accessResult.messages)
    }
  }
}
