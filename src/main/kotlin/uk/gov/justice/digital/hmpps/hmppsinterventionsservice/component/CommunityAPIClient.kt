package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException.BadRequest
import reactor.core.publisher.Mono

@Component
class CommunityAPIClient(
  private val communityApiWebClient: WebClient,
) {
  companion object : KLogging()

  fun withCustomAuth(authentication: JwtAuthenticationToken): CommunityAPIClient {
    return CommunityAPIClient(
      communityApiWebClient.mutate()
        .defaultHeaders { headers -> headers.setBearerAuth(authentication.token.tokenValue) }
        .build()
    )
  }

  fun makeAsyncPostRequest(uri: String, requestBody: Any) {
    communityApiWebClient.post().uri(uri)
      .body(Mono.just(requestBody), requestBody::class.java)
      .retrieve()
      .bodyToMono(Unit::class.java)
      .onErrorResume { e ->
        handleResponse(e, requestBody)
        Mono.empty()
      }
      .subscribe()
  }

  fun makeAsyncPatchRequest(uri: String, requestBody: Any) {
    communityApiWebClient.patch().uri(uri)
      .body(Mono.just(requestBody), requestBody::class.java)
      .retrieve()
      .bodyToMono(Unit::class.java)
      .onErrorResume { e ->
        handleResponse(e, requestBody)
        Mono.empty()
      }
      .subscribe()
  }

  fun <T : Any> makeSyncPostRequest(uri: String, requestBody: Any, responseBodyClass: Class<T>): T {
    return communityApiWebClient.post().uri(uri)
      .body(Mono.just(requestBody), requestBody::class.java)
      .retrieve()
      .bodyToMono(responseBodyClass)
      .onErrorMap { e ->
        handleResponse(e, requestBody)
        e
      }
      .block()
  }

  fun <T : Any> makeSyncGetRequest(uri: String, responseBodyClass: Class<T>): T {
    return communityApiWebClient.get().uri(uri)
      .retrieve()
      .bodyToMono(responseBodyClass)
      .onErrorMap { e ->
        handleResponse(e, "")
        e
      }
      .block()
  }

  fun handleResponse(e: Throwable, requestBody: Any): String {
    val responseBodyAsString = when (e) {
      is BadRequest -> e.responseBodyAsString
      else -> e.localizedMessage
    }
    logger.error(
      "Call to community api failed",
      e,
      StructuredArguments.kv("req.body", requestBody),
      StructuredArguments.kv("res.body", responseBodyAsString)
    )
    return responseBodyAsString.let { it } ?: "No response body message"
  }
}
