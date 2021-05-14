package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

@Component
class UserTypeChecker {
  fun isServiceProviderUser(user: AuthUser): Boolean {
    return user.authSource == "auth"
  }

  fun isProbationPractitionerUser(user: AuthUser): Boolean {
    return user.authSource == "delius"
  }
}
