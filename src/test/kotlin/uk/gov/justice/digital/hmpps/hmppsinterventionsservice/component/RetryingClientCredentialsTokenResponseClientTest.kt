package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import ch.qos.logback.classic.Level
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.security.oauth2.client.endpoint.OAuth2ClientCredentialsGrantRequest
import org.springframework.security.oauth2.client.registration.ClientRegistration
import org.springframework.security.oauth2.core.AuthorizationGrantType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingSpyTest
import java.util.concurrent.TimeUnit

class RetryingClientCredentialsTokenResponseClientTest : LoggingSpyTest(RetryingClientCredentialsTokenResponseClient::class, Level.INFO) {
  private val mockWebServer = MockWebServer()
  private val grantRequest = OAuth2ClientCredentialsGrantRequest(
    ClientRegistration.withRegistrationId("test-registration")
      .clientId("test-client")
      .tokenUri(mockWebServer.url("/oauth/token").toString())
      .authorizationGrantType(AuthorizationGrantType.CLIENT_CREDENTIALS)
      .build()
  )

  @Test
  fun `client retries the correct number of times on different types of timeout`() {
    // error responses
    mockWebServer.enqueue(MockResponse().setResponseCode(500))

    // read timeouts
    mockWebServer.enqueue(MockResponse().setHeadersDelay(100, TimeUnit.MILLISECONDS))

    // success
    mockWebServer.enqueue(
      MockResponse()
        .setResponseCode(200)
        .setHeader("Content-Type", "application/json")
        .setBody(
          """
        {
          "token_type": "Bearer",
          "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        }
       """
        )
    )

    val tokenConfig = TokenRequestConfig(
      connectTimeoutMs = 50,
      readTimeoutMs = 50,
      retries = 3,
      retryDelayMs = 0,
    )

    val client = RetryingClientCredentialsTokenResponseClient(
      tokenConfig,
      RestTemplateBuilder(),
    )

    client.getTokenResponse(grantRequest)

    assertThat(logEvents.size).isEqualTo(2)

    assertThat(logEvents[0].message).isEqualTo("token request failed; retrying")
    assertThat(logEvents[0].throwableProxy.message).contains("500 Server Error")

    assertThat(logEvents[1].message).isEqualTo("token request failed; retrying")
    assertThat(logEvents[1].throwableProxy.message).contains("Read timed out")
  }
}
