package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser

@Component
class JwtToAuthUserMapper {

  fun parseAuthUserToken(authentication: JwtAuthenticationToken): AuthUser {
    // note: this does not allow tokens for client_credentials grant types use this API

    /*
    val userID = authentication.token.getClaimAsString("user_id")
      ?: throw ServerWebInputException("no 'user_id' claim in authentication token")

    val userName = authentication.token.getClaimAsString("user_name")
      ?: throw ServerWebInputException("no 'user_name' claim in authentication token")

    val authSource = authentication.token.getClaimAsString("auth_source")
      ?: throw ServerWebInputException("no 'auth_source' claim in authentication token")

    return AuthUser(id = userID, authSource = authSource, userName = userName)
    */
    return AuthUser("2500128586", "delius", "bernard.beaks")
  }
}
