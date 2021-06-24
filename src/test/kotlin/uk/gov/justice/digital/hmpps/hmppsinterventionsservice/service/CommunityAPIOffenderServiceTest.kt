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

private data class MockedResponse(
  val path: String,
  val status: HttpStatus,
  val responseBody: String,
)

internal class CommunityAPIOffenderServiceTest {
  private val user = AuthUserFactory().create()
  private val offenderAccessLocation = "offender-access"
  private val managedOffendersLocation = "managed-offenders"
  private val staffDetailsLocation = "staff-details"

  private fun createMockedRestClient(vararg responses: MockedResponse): RestClient {
    return RestClient(
      WebClient.builder()
        .exchangeFunction exchange@{ req ->
          responses.forEach {
            if (req.url().path == it.path) {
              return@exchange Mono.just(
                ClientResponse.create(it.status)
                  .header("content-type", "application/json")
                  .body(it.responseBody)
                  .build()
              )
            }
          }
          Mono.empty()
        }
        .build(),
      "client-registration-id"
    )
  }

  private fun offenderServiceFactory(restClient: RestClient): CommunityAPIOffenderService {
    return CommunityAPIOffenderService(offenderAccessLocation, managedOffendersLocation, staffDetailsLocation, restClient)
  }

  @Test
  fun `checkIfAuthenticatedDeliusUserHasAccessToServiceUser success`() {
    val response = MockedResponse(offenderAccessLocation, HttpStatus.OK, "{\"exclusionMessage\": null, \"restrictionMessage\": null}")
    val offenderService = offenderServiceFactory(createMockedRestClient(response))
    val result = offenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(user, "X123456")
    assertThat(result.canAccess).isTrue
    assertThat(result.messages).isEmpty()
  }

  @Test
  fun `checkIfAuthenticatedDeliusUserHasAccessToServiceUser forbidden`() {
    val response = MockedResponse(offenderAccessLocation, HttpStatus.FORBIDDEN, "{\"exclusionMessage\": \"family exclusion\", \"restrictionMessage\": null}")
    val offenderService = offenderServiceFactory(createMockedRestClient(response))
    val result = offenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(user, "X123456")
    assertThat(result.canAccess).isFalse
    assertThat(result.messages).isEqualTo(listOf("family exclusion"))
  }

  @Test
  fun `checkIfAuthenticatedDeliusUserHasAccessToServiceUser unhandled error`() {
    val response = MockedResponse(offenderAccessLocation, HttpStatus.INTERNAL_SERVER_ERROR, "")
    val offenderService = offenderServiceFactory(createMockedRestClient(response))
    assertThrows<WebClientResponseException> {
      offenderService.checkIfAuthenticatedDeliusUserHasAccessToServiceUser(user, "X123456")
    }
  }

  @Test
  fun `getManagedOffendersForDeliusUser returns empty list if user has no staff identifier`() {
    val response = MockedResponse(staffDetailsLocation, HttpStatus.NOT_FOUND, "")
    val offenderService = offenderServiceFactory(createMockedRestClient(response))
    val result = offenderService.getManagedOffendersForDeliusUser(user)
    assertThat(result.isEmpty())
  }

  @Test
  fun `getManagedOffendersForDeliusUser returns list of offenders`() {
    val staffResponse = MockedResponse(staffDetailsLocation, HttpStatus.OK, "{\"staffIdentifier\": \"tom\"}")
    val offendersResponse = MockedResponse(managedOffendersLocation, HttpStatus.OK, "[{\"crnNumber\": \"CRN123\"}, {\"crnNumber\": \"CRN456\"}]")
    val offenderService = offenderServiceFactory(createMockedRestClient(staffResponse, offendersResponse))
    val result = offenderService.getManagedOffendersForDeliusUser(user)
    assertThat(result).isEqualTo(listOf(Offender("CRN123"), Offender("CRN456")))
  }
}
