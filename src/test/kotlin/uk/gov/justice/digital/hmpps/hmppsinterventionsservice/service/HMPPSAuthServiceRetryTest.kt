package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import io.netty.handler.timeout.ReadTimeoutHandler
import io.netty.handler.timeout.WriteTimeoutHandler
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.SocketPolicy.NO_RESPONSE
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import org.springframework.web.reactive.function.client.WebClient
import reactor.netty.http.client.HttpClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import java.time.Duration
import java.util.concurrent.TimeUnit

class HMPPSAuthServiceRetryTest {

  private val httpClient = HttpClient.create()
    .doOnConnected {
      it
        .addHandlerLast(ReadTimeoutHandler(2))
        .addHandlerLast(WriteTimeoutHandler(2))
    }
    .responseTimeout(Duration.ofSeconds(2))
  private val mockWebServer = MockWebServer()
  private val webClient = WebClient.builder()
    .baseUrl(mockWebServer.url("/").toString())
    .clientConnector(ReactorClientHttpConnector(httpClient))
    .build()
  private val hmppsAuthService = HMPPSAuthService(
    "/authuser/groups",
    "/authuser/detail",
    "/user/email",
    "/user/detail",
    2L,
    RestClient(webClient, "client-registration-id")
  )

  @Test
  fun `getServiceProviderOrganizationForUser when no response`() {

    mockWebServer.enqueue(MockResponse().setSocketPolicy(NO_RESPONSE))

    val exception = assertThrows<IllegalStateException> {
      hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "auth", "username"))
    }

    assertThat(exception.javaClass.canonicalName).isEqualTo("reactor.core.Exceptions.RetryExhaustedException")
    assertThat(exception.message).isEqualTo("Retries exhausted: 2/2")
  }

  @Test
  fun `getServiceProviderOrganizationForUser when delayed response`() {

    mockWebServer.enqueue(
      MockResponse()
        .setHeader("content-type", "application/json")
        .setBody(
          """[
       { "groupCode": "NPS_N0", "groupName": "NPS North East" },
       { "groupCode": "INT_SP_HARMONY_LIVING", "groupName": "Harmony Living" },
       { "groupCode": "INT_SP_NEW_BEGINNINGS", "groupName": "New Beginnings" }
    ]
          """.trimIndent()
        )
        .setHeadersDelay(7, TimeUnit.SECONDS)
    )

    val exception = assertThrows<IllegalStateException> {
      hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "auth", "username"))
    }

    assertThat(exception.javaClass.canonicalName).isEqualTo("reactor.core.Exceptions.RetryExhaustedException")
    assertThat(exception.message).isEqualTo("Retries exhausted: 2/2")
  }
}
