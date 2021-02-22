package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
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
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "auth", "username"))
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
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "auth", "username"))
    assertThat(org).isNull()
  }

  @Test
  fun `getServiceProviderOrganizationForUser returns null if there are no orgs at all`() {
    mockWebServer.enqueue(
      MockResponse()
        .setHeader("content-type", "application/json")
        .setBody("[]")
    )
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "auth", "username"))
    assertThat(org).isNull()
  }

  @Test
  fun `getServiceProviderOrganizationForUser returns null if the user is a delius user`() {
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "delius", "username"))
    assertThat(org).isNull()
  }

  @Test
  fun `getServiceProviderOrganizationForUser returns null if the user is a nomis user`() {
    val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "nomis", "username"))
    assertThat(org).isNull()
  }

  @Test
  fun `getServiceProviderOrganizationForUser propagates http errors`() {
    mockWebServer.enqueue(MockResponse().setResponseCode(404))
    assertThrows<WebClientResponseException> {
      val org = hmppsAuthService.getServiceProviderOrganizationForUser(AuthUser("id", "auth", "username"))
    }
  }
}
