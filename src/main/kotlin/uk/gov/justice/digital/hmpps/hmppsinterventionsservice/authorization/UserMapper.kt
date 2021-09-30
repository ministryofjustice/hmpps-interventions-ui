package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.data.repository.findByIdOrNull
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository

@Component
class UserMapper(
  private val authUserRepository: AuthUserRepository,
) {
  fun isUserRequest(authentication: JwtAuthenticationToken): Boolean =
    authentication.token.getClaimAsString("user_id") != null

  fun fromToken(authentication: JwtAuthenticationToken): AuthUser {
    val errors = mutableListOf<String>()

    val userID = authentication.token.getClaimAsString("user_id")
    if (userID == null) {
      errors.add("no 'user_id' claim in token")
    }

    val userName = authentication.token.getClaimAsString("user_name")
    if (userName == null) {
      errors.add("no 'user_name' claim in token")
    }

    val authSource = authentication.token.getClaimAsString("auth_source")
    if (authSource == null) {
      errors.add("no 'auth_source' claim in token")
    }

    if (errors.isNotEmpty()) {
      throw AccessDeniedException("could not map auth token to user: $errors")
    }

    return AuthUser(id = userID, authSource = authSource, userName = userName)
  }

  fun fromId(id: String): AuthUser {
    return authUserRepository.findByIdOrNull(id)
      ?: throw AccessDeniedException("could not map user id to user: user does not exist")
  }
}
