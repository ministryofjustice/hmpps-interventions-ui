package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.web.reactive.function.client.WebClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.org.lidalia.slf4jtest.TestLoggerFactory

class HMPPSAuthServiceTest {
  private val mockWebServer = MockWebServer()
  private val hmppsAuthService = HMPPSAuthService(
    "/",
    WebClient.create(
      mockWebServer.url("/").toString()
    )
  )

  @AfterEach
  fun teardown() {
    TestLoggerFactory.clear()
  }

  @Test
  fun `getServiceProviderOrganizationForUser filters results and returns the first service provider org`() {
    mockWebServer.enqueue(
      MockResponse()
        .setHeader("content-type", "application/json")
        .setBody(
          """[
       { "groupCode": "NPS_N02", "groupName": "NPS North East" },
       { "groupCode": "INT_SP_HARMONY_LIVING", "groupName": "Harmony Living" },
       { "groupCode": "INT_SP_NEW_BEGINNINGS", "groupName": "New Beginnings" } 
    ]
          """.trimIndent()
        )
    )
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "source", "username"))
    assertThat(org).isEqualTo("HARMONY_LIVING")
  }

  @Test
  fun `getServiceProviderOrganizationForUser returns null if there are no service provider orgs`() {
    mockWebServer.enqueue(
      MockResponse()
        .setHeader("content-type", "application/json")
        .setBody(
          """[
       { "groupCode": "NPS_N02", "groupName": "NPS North East" }
    ]
          """.trimIndent()
        )
    )
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "source", "username"))
    assertThat(org).isNull()
  }

  @Test
  fun `getServiceProviderOrganizationForUser returns null if there are no orgs at all`() {
    mockWebServer.enqueue(
      MockResponse()
        .setHeader("content-type", "application/json")
        .setBody("[]")
    )
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "source", "username"))
    assertThat(org).isNull()
  }

  @Test
  fun `getServiceProviderOrganizationForUser returns null and logs error on http error`() {
    TestLoggerFactory.clear()
    val logger = TestLoggerFactory.getTestLogger(HMPPSAuthService::class.java)

    mockWebServer.enqueue(MockResponse().setResponseCode(500))
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "source", "username"))
    assertThat(org).isNull()

    assertThat(logger.allLoggingEvents.size).isEqualTo(1)
    assertThat(logger.allLoggingEvents[0].level.name).isEqualTo("ERROR")
  }

  @Test
  fun `getServiceProviderOrganizationForUser returns null on 404 from auth`() {
    TestLoggerFactory.clear()
    val logger = TestLoggerFactory.getTestLogger(HMPPSAuthService::class.java)

    mockWebServer.enqueue(MockResponse().setResponseCode(404))
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "source", "username"))
    assertThat(org).isNull()

    assertThat(logger.allLoggingEvents.size).isEqualTo(0)
  }
}
