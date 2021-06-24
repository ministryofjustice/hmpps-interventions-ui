package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.http.MediaType
import org.springframework.security.oauth2.client.web.reactive.function.client.ServletOAuth2AuthorizedClientExchangeFilterFunction
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.util.MultiValueMap
import org.springframework.web.reactive.function.client.WebClient
import java.nio.charset.StandardCharsets

class RestClient(
  private val webClient: WebClient,
  private val oauth2ClientRegistrationId: String,
) {
  fun get(
    uri: String,
    queryParams: MultiValueMap<String, String>? = null,
    customAuthentication: JwtAuthenticationToken? = null,
  ): WebClient.RequestHeadersSpec<*> {
    val spec = webClient
      .get()
      .uri {
        it
          .path(uri)
          .queryParams(queryParams)
          .build()
      }

    return spec
      .withDefaultHeaders()
      .withAuth(customAuthentication)
  }

  fun <T> post(
    uri: String,
    body: T,
    customAuthentication: JwtAuthenticationToken? = null,
  ): WebClient.RequestHeadersSpec<*> {
    val spec = webClient
      .post()
      .uri(uri)
      .bodyValue(body)

    return spec
      .withDefaultHeaders()
      .withAuth(customAuthentication)
  }

  fun <T> patch(
    uri: String,
    body: T,
    customAuthentication: JwtAuthenticationToken? = null,
  ): WebClient.RequestHeadersSpec<*> {
    val spec = webClient
      .patch()
      .uri(uri)
      .bodyValue(body)

    return spec
      .withDefaultHeaders()
      .withAuth(customAuthentication)
  }

  private fun WebClient.RequestHeadersSpec<*>.withDefaultHeaders(): WebClient.RequestHeadersSpec<*> {
    return this
      .accept(MediaType.APPLICATION_JSON)
      .acceptCharset(StandardCharsets.UTF_8)
  }

  private fun WebClient.RequestHeadersSpec<*>.withAuth(authentication: JwtAuthenticationToken?): WebClient.RequestHeadersSpec<*> {
    return authentication?.let {
      this.header("Authorization", "Bearer ${it.token.tokenValue}")
    }
      ?: this.attributes(ServletOAuth2AuthorizedClientExchangeFilterFunction.clientRegistrationId(oauth2ClientRegistrationId))
  }
}
