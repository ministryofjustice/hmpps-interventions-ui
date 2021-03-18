package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.LoggerContext
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ExchangeFunction
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingMemoryAppender
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIServiceTest {

  private val exchangeFunction = mock<ExchangeFunction>()
  private lateinit var communityAPIService: CommunityAPIService

  companion object {
    private val logger = LoggerFactory.getLogger(CommunityAPIService::class.java) as Logger
    private var memoryAppender = LoggingMemoryAppender()

    @BeforeAll
    @JvmStatic
    fun setupAll() {
      memoryAppender.context = LoggerFactory.getILoggerFactory() as LoggerContext
      logger.addAppender(memoryAppender)
      memoryAppender.start()
    }

    @AfterAll
    @JvmStatic
    fun teardownAll() {
      logger.detachAppender(memoryAppender)
    }
  }

  @AfterEach
  fun teardown() {
    memoryAppender.reset()
  }

  @Test
  fun `got service successfully`() {
    val communityApiWebClient = WebClient.builder()
      .exchangeFunction(exchangeFunction)
      .build()

    communityAPIService = CommunityAPIService(
      "A00",
      "C385",
      "ASPUATU",
      "ASPUAT",
      "http://testUrl",
      "secure/offenders/crn/{id}/referral/sent",
      "secure/offenders/crn/{id}/referral/sent",
      communityApiWebClient
    )

    whenever(exchangeFunction.exchange(any()))
      .thenReturn(Mono.empty())

    communityAPIService.onApplicationEvent(referralSentEvent)

    verify(exchangeFunction, times(1)).exchange(any())

    val requestCaptor = argumentCaptor<ClientRequest>()
    verify(exchangeFunction).exchange(requestCaptor.capture())
    val requestDetails = requestCaptor.firstValue

    assertThat("secure/offenders/crn/X123456/referral/sent").isEqualTo(requestDetails.url().toString())
  }

  @Test
  fun `error was logged on exception`() {
    val communityApiWebClient = WebClient.builder()
      .exchangeFunction(exchangeFunction)
      .build()

    communityAPIService = CommunityAPIService(
      "A00",
      "C385",
      "ASPUATU",
      "ASPUAT",
      "http://testUrl",
      "/referral/{id}/sent",
      "/referral/{id}/sent",
      communityApiWebClient
    )

    whenever(exchangeFunction.exchange(any())).thenThrow(RuntimeException::class.java)
    communityAPIService.onApplicationEvent(referralSentEvent)
    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("ERROR")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Call to community api to update contact log failed")
  }

  private val referralSentEvent = ReferralEvent(
    "source",
    ReferralEventType.SENT,
    SampleData.sampleReferral(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
      crn = "X123456",
      serviceProviderName = "Harmony Living",
      sentAt = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 0, ZoneOffset.of("+00:00"))
    ),
    "http://localhost:8080/sent-referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"
  )
}
