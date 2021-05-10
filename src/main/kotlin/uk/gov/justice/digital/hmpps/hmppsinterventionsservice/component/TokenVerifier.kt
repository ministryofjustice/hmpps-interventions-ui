package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

@Component
class TokenVerifier : OAuth2TokenValidator<Jwt> {
  override fun validate(jwt: Jwt): OAuth2TokenValidatorResult {
    // todo: call token verification service to validate the token
    return OAuth2TokenValidatorResult.success()
  }
}
