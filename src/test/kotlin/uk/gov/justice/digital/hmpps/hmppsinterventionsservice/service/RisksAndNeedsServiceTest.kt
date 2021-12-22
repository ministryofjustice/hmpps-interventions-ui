package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import ch.qos.logback.classic.Level
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.springframework.security.core.context.SecurityContext
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.web.reactive.function.client.WebClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingSpyTest
import java.time.OffsetDateTime
import java.util.UUID
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.assertThrows
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.reactive.function.client.WebClientResponseException
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory

internal class RisksAndNeedsServiceTest : LoggingSpyTest(RisksAndNeedsService::class, Level.WARN) {
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
  inner class createSupplementaryRiskWithOasysRiskInformation {
    val oasysRiskInformation = RedactedRisk(
      "someone", "all the time", "bad", "none", "none", "none", "none",
    )

    @Test
    fun `logs warning and fails on http 409 response`() {
      mockWebServer.enqueue(MockResponse().setResponseCode(409))

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

      assertThat(logEvents[0].message).contains("attempted to create new supplementary risk, but risk already exists for this referral")
    }
  }

  @Nested
  inner class createSupplementaryRiskWithOldStyleAdditionalRiskInformation {
    @Test
    fun `logs warning and fails on http 409 response`() {
      mockWebServer.enqueue(MockResponse().setResponseCode(409))

      val risksAndNeedsService = RisksAndNeedsService(
        "/risk/supplementary",
        false,
        restClient,
      )

      assertThrows<WebClientResponseException> {
        risksAndNeedsService.createSupplementaryRisk(
          UUID.randomUUID(),
          "CRN123",
          authUserFactory.createPP(),
          OffsetDateTime.now(),
          "additional information",
        )
      }

      assertThat(logEvents[0].message).contains("attempted to create new supplementary risk, but risk already exists for this referral")
    }
  }
}
