package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.http.MediaType
import org.springframework.util.MultiValueMap
import org.springframework.web.reactive.function.client.WebClient
import java.nio.charset.StandardCharsets

class RestClient(
  private val webClient: WebClient,
) {
  fun get(uri: String, queryParams: MultiValueMap<String, String>? = null): WebClient.RequestHeadersSpec<*> {
    val spec = webClient
      .get()
      .uri {
        it
          .path(uri)
          .queryParams(queryParams)
          .build()
      }

    return withDefaultHeaders(spec)
  }

  fun <T> post(uri: String, body: T): WebClient.RequestHeadersSpec<*> {
    val spec = webClient
      .post()
      .uri(uri)
      .bodyValue(body)

    return withDefaultHeaders(spec)
  }

  fun <T> patch(uri: String, body: T): WebClient.RequestHeadersSpec<*> {
    val spec = webClient
      .patch()
      .uri(uri)
      .bodyValue(body)

    return withDefaultHeaders(spec)
  }

  private fun withDefaultHeaders(spec: WebClient.RequestHeadersSpec<*>): WebClient.RequestHeadersSpec<*> {
    return spec
      .accept(MediaType.APPLICATION_JSON)
      .acceptCharset(StandardCharsets.UTF_8)
  }
}
