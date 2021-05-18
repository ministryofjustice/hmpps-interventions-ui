package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
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

  fun createEncodedToken(
    userID: String? = "user",
    authSource: String? = "authSource",
    userName: String? = "username"
  ): String {
    val jwk = RSAKeyGenerator(2048).keyID("123").generate()
    val claimsBuilder = JWTClaimsSet.Builder()
    userID?.let { claimsBuilder.claim("user_id", it) }
    authSource?.let { claimsBuilder.claim("auth_source", it) }
    userName?.let { claimsBuilder.claim("user_name", userName) }
    val claims = claimsBuilder.build()
    val jwsHeader: JWSHeader = JWSHeader.Builder(JWSAlgorithm.RS256).keyID(jwk.keyID).build()
    val jwt = SignedJWT(jwsHeader, claims)
    jwt.sign(RSASSASigner(jwk))
    return jwt.serialize()
  }
}
