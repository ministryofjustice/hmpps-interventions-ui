package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import com.nimbusds.jwt.JWTParser
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.MappedJwtClaimSetConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter

@Configuration
@EnableWebSecurity
class ResourceServerConfiguration : WebSecurityConfigurerAdapter() {
  // todo: add custom token validator which calls token verification service
  override fun configure(http: HttpSecurity) {
    http
      .sessionManagement()
      .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      .and().csrf().disable()
      .authorizeRequests {
        it.antMatchers("/health/**", "/info", "/test/**").permitAll()
        it.anyRequest().authenticated()
      }
      .oauth2ResourceServer().jwt().jwtAuthenticationConverter(jwtAuthenticationConverter())
  }

  @Bean
  fun jwtAuthenticationConverter(): JwtAuthenticationConverter {
    // hmpps auth tokens have roles in a custom `authorities` claim.
    // the authorities are already prefixed with `ROLE_`.
    val grantedAuthoritiesConverter = JwtGrantedAuthoritiesConverter()
    grantedAuthoritiesConverter.setAuthoritiesClaimName("authorities")
    grantedAuthoritiesConverter.setAuthorityPrefix("")

    val jwtAuthenticationConverter = JwtAuthenticationConverter()
    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter)
    return jwtAuthenticationConverter
  }

  @Bean
  @Profile("test")
  fun testJwtDecoder(): JwtDecoder {
    return TestJwtDecoder()
  }
}

internal class TestJwtDecoder : JwtDecoder {
  private val claimSetConverter = MappedJwtClaimSetConverter.withDefaults(emptyMap())

  override fun decode(token: String): Jwt? {
    // extract headers and claims, but do not attempt to verify signature
    val jwt = JWTParser.parse(token)
    val headers = LinkedHashMap<String, Any>(jwt.header.toJSONObject())
    val claims = claimSetConverter.convert(jwt.getJWTClaimsSet().claims)

    return Jwt.withTokenValue(token)
      .headers { it.putAll(headers) }
      .claims { it.putAll(claims) }
      .build()
  }
}
