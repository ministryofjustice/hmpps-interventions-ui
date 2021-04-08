package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException.BadRequest
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception.BadRequestException

@Component
class CommunityAPIClient(
  private val communityApiWebClient: WebClient,
) {
  companion object : KLogging()

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

  fun makeSyncPostRequest(uri: String, requestBody: Any) {
    communityApiWebClient.post().uri(uri)
      .body(Mono.just(requestBody), requestBody::class.java)
      .retrieve()
      .bodyToMono(Unit::class.java)
      .onErrorMap { e ->
        val responseBodyAsString = handleResponse(e, requestBody)
        BadRequestException(responseBodyAsString)
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
