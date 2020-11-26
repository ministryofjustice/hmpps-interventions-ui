package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.ResponseBody
import java.time.Instant

data class SecureResponse(
  val client: String?,
  val roles: List<String>,
  val tokenExpiry: Instant?
)

// fixme: this class is purely here to illustrate a secure endpoint. will be removed in near future.
@Controller
class SecureController {
  @GetMapping("/secure")
  @ResponseBody
  fun secure(authentication: JwtAuthenticationToken): SecureResponse {
    val expiry = authentication.token.expiresAt
    return SecureResponse(authentication.name, authentication.authorities.map { it.authority }, expiry)
  }
}
