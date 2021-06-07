package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import org.springframework.web.reactive.function.client.ClientResponse
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory

internal class CommunityAPIOffenderServiceTest {
  private val authUserFactory = AuthUserFactory()

  private fun createMockedRestClient(status: HttpStatus, responseBody: String): RestClient {
    return RestClient(
      WebClient.builder()
        .exchangeFunction {
          Mono.just(
            ClientResponse.create(status)
              .header("content-type", "application/json")
              .body(responseBody)
              .build()
          )
        }.build()
    )
  }

  @Test
  fun `checkIfAuthenticatedDeliusUserHasAccessToServiceUser success`() {
    val client = createMockedRestClient(HttpStatus.OK, "{\"exclusionMessage\": null, \"restrictionMessage\": null}")
    val offenderService = CommunityAPIOffenderService("/", client)
    val result = offenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(authUserFactory.create(), "X123456")
    assertThat(result.canAccess).isTrue
    assertThat(result.messages).isEmpty()
  }

  @Test
  fun `checkIfAuthenticatedDeliusUserHasAccessToServiceUser forbidden`() {
    val client = createMockedRestClient(HttpStatus.FORBIDDEN, "{\"exclusionMessage\": \"family exclusion\", \"restrictionMessage\": null}")
    val offenderService = CommunityAPIOffenderService("/", client)
    val result = offenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(authUserFactory.create(), "X123456")
    assertThat(result.canAccess).isFalse
    assertThat(result.messages).isEqualTo(listOf("family exclusion"))
  }

  @Test
  fun `checkIfAuthenticatedDeliusUserHasAccessToServiceUser unhandled error`() {
    val client = createMockedRestClient(HttpStatus.INTERNAL_SERVER_ERROR, "{\"exclusionMessage\": null, \"restrictionMessage\": null}")
    val offenderService = CommunityAPIOffenderService("/", client)
    assertThrows<WebClientResponseException> {
      offenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(authUserFactory.create(), "X123456")
    }
  }
}
