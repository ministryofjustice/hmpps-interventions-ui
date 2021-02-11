package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

class JwtTokenFactory {
  fun create(
    userID: String = "user",
    authSource: String = "authSource",
    userName: String = "username",
    authorities: Array<String> = arrayOf("ROLES_PROBATION")
  ): JwtAuthenticationToken {
    val jwt: Jwt = Jwt.withTokenValue("token")
      .header("alg", "none")
      .claim("user_id", userID)
      .claim("auth_source", authSource)
      .claim("user_name", userName)
      .build()
    val authorities: Collection<GrantedAuthority> = AuthorityUtils.createAuthorityList(*authorities)
    return JwtAuthenticationToken(jwt, authorities)
  }
}
