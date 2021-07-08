package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.JsonMappingException
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClientResponseException
import org.springframework.web.reactive.function.client.WebClientResponseException.BadRequest
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception.CommunityApiCallError

@Component
class CommunityAPIClient(
  private val communityApiClient: RestClient,
  private val objectMapper: ObjectMapper,
) {
  companion object : KLogging()

  fun makeAsyncPostRequest(uri: String, requestBody: Any) {
    communityApiClient.post(uri, requestBody)
      .retrieve()
      .bodyToMono(Unit::class.java)
      .onErrorResume { e ->
        handleResponse(e, requestBody)
        Mono.empty()
      }
      .subscribe()
  }

  fun makeAsyncPatchRequest(uri: String, requestBody: Any) {
    communityApiClient.patch(uri, requestBody)
      .retrieve()
      .bodyToMono(Unit::class.java)
      .onErrorResume { e ->
        handleResponse(e, requestBody)
        Mono.empty()
      }
      .subscribe()
  }

  fun <T : Any> makeSyncPostRequest(uri: String, requestBody: Any, responseBodyClass: Class<T>): T {
    return communityApiClient.post(uri, requestBody)
      .retrieve()
      .bodyToMono(responseBodyClass)
      .onErrorMap { e ->
        handleResponse(e, requestBody)
      }
      .block()
  }

  fun <T : Any> makeSyncGetRequest(uri: String, responseBodyClass: Class<T>): T {
    return communityApiClient.get(uri)
      .retrieve()
      .bodyToMono(responseBodyClass)
      .onErrorMap { e ->
        handleResponse(e, "")
      }
      .block()
  }

  fun handleResponse(e: Throwable, requestBody: Any): CommunityApiCallError {
    val responseBodyAsString = when (e) {
      is BadRequest -> e.responseBodyAsString
      else -> e.localizedMessage
    }

    val statusCode = when (e) {
      is WebClientResponseException -> e.statusCode
      else -> INTERNAL_SERVER_ERROR
    }

    val causeMessage = userMessageOrDeveloperMessageOrResponseBodyInThatOrder(responseBodyAsString)
    val error = CommunityApiCallError(statusCode, causeMessage, responseBodyAsString, e)
    logger.error(
      "Call to community api failed [${error.category}]",
      e,
      StructuredArguments.kv("req.body", requestBody),
      StructuredArguments.kv("res.body", responseBodyAsString),
      StructuredArguments.kv("res.causeMessage", causeMessage)
    )

    return error
  }

  private fun userMessageOrDeveloperMessageOrResponseBodyInThatOrder(responseBody: String): String {
    try {
      objectMapper.readValue(responseBody, ObjectNode::class.java)?.let { node ->
        val userMessage = node.get("userMessage") ?: run {
          val developerMessage = node.get("developerMessage")
          return developerMessage.textValue()
        }
        return userMessage.textValue()
      }
      return responseBody
    } catch (e: JsonProcessingException) {
      // response body does not contain json
      return responseBody
    } catch (e: JsonMappingException) {
      // response body does not contain json
      return responseBody
    }
  }
}
