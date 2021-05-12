package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import org.springframework.web.server.ServerWebInputException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

@Component
class UserMapper {
  fun fromToken(authentication: JwtAuthenticationToken): AuthUser {
    val userID = authentication.token.getClaimAsString("user_id")
      ?: throw ServerWebInputException("no 'user_id' claim in authentication token")

    val userName = authentication.token.getClaimAsString("user_name")
      ?: throw ServerWebInputException("no 'user_name' claim in authentication token")

    val authSource = authentication.token.getClaimAsString("auth_source")
      ?: throw ServerWebInputException("no 'auth_source' claim in authentication token")

    // should we persist the user here??
    return AuthUser(id = userID, authSource = authSource, userName = userName)
  }
}
