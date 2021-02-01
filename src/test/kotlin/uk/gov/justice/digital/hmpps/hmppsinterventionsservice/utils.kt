package uk.gov.justice.digital.hmpps.hmppsinterventionsservice

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.AuthorityUtils
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken

fun createJwtAuthenticationToken(
  userID: String = "user",
  authSource: String = "authSource",
  authorities: Array<String> = arrayOf("ROLES_PROBATION")
): JwtAuthenticationToken {
  val jwt: Jwt = Jwt.withTokenValue("token")
    .header("alg", "none")
    .claim("user_id", userID)
    .claim("auth_source", authSource)
    .build()
  val authorities: Collection<GrantedAuthority> = AuthorityUtils.createAuthorityList(*authorities)
  return JwtAuthenticationToken(jwt, authorities)
}
