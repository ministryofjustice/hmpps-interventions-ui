package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import ch.qos.logback.classic.Level
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingSpyTest
import java.time.OffsetDateTime
import java.util.UUID

internal class RisksAndNeedsServiceTest : LoggingSpyTest(RisksAndNeedsService::class, Level.ERROR) {
  private val mockWebServer = MockWebServer()
  private val restClient = RestClient(
    WebClient.create(mockWebServer.url("/").toString()),
    "client-registration-id"
  )
  private val authUserFactory = AuthUserFactory()
  private val jwtTokenFactory = JwtTokenFactory()

  @BeforeEach
  fun `set security context`() {
    val token = jwtTokenFactory.create()
    val context = mock<SecurityContext>()
    whenever(context.authentication).thenReturn(token)
    SecurityContextHolder.setContext(context)
  }

  @Nested
  inner class createSupplementaryRisk {
    val oasysRiskInformation = RedactedRisk(
      "someone", "all the time", "bad", "none", "none", "none", "none",
    )

    @Test
    fun `ignores http 409 response when risk is up to date`() {
      mockWebServer.enqueue(
        MockResponse()
          .setResponseCode(409)
          .setHeader("Content-Type", "application/json")
          .setBody(
            """
        { 
          "supplementaryRiskId": "f974d97e-9f50-4963-91f3-a619f50ad127",
          "createdDate": "2020-12-04T10:42:43+00:00"
        }
            """.trimIndent()
          )
      )

      val risksAndNeedsService = RisksAndNeedsService(
        "/risk/supplementary",
        true,
        restClient,
      )

      risksAndNeedsService.createSupplementaryRisk(
        UUID.randomUUID(),
        "CRN123",
        authUserFactory.createPP(),
        OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
        "additional information",
        oasysRiskInformation,
      )

      assertThat(logEvents).isEmpty()
    }

    @Test
    fun `logs error and fails on http 409 response when risk is out of date`() {
      mockWebServer.enqueue(
        MockResponse()
          .setResponseCode(409)
          .setHeader("Content-Type", "application/json")
          .setBody(
            """
        { 
          "supplementaryRiskId": "f974d97e-9f50-4963-91f3-a619f50ad127",
          "createdDate": "2020-12-04T10:42:43+00:00"
        }
            """.trimIndent()
          )
      )

      val risksAndNeedsService = RisksAndNeedsService(
        "/risk/supplementary",
        true,
        restClient,
      )

      assertThrows<WebClientResponseException> {
        risksAndNeedsService.createSupplementaryRisk(
          UUID.randomUUID(),
          "CRN123",
          authUserFactory.createPP(),
          OffsetDateTime.now(),
          "additional information",
          oasysRiskInformation,
        )
      }

      assertThat(logEvents[0].message).contains("attempted to update an existing supplementary risk with new data")
    }
  }
}
