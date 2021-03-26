package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

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
        logger.error("Call to community api failed", e, StructuredArguments.kv("requestBody", requestBody))
        Mono.empty()
      }
      .subscribe()
  }
}
