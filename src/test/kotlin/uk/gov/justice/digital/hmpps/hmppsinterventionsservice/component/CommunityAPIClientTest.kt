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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingMemoryAppender
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIClientTest {

  private val exchangeFunction = mock<ExchangeFunction>()
  private lateinit var communityAPIClient: CommunityAPIClient

  companion object {
    private val logger = LoggerFactory.getLogger(CommunityAPIClient::class.java) as Logger
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
  fun `makes request successfully`() {

    communityAPIClient = CommunityAPIClient(
      WebClient.builder().exchangeFunction(exchangeFunction).build()
    )
    whenever(exchangeFunction.exchange(any())).thenReturn(Mono.empty())

    communityAPIClient.makeAsyncPostRequest("/uriValue", referralSentEvent)

    verify(exchangeFunction, times(1)).exchange(any())
    val requestCaptor = argumentCaptor<ClientRequest>()
    verify(exchangeFunction).exchange(requestCaptor.capture())
    val requestDetails = requestCaptor.firstValue

    assertThat("/uriValue").isEqualTo(requestDetails.url().toString())
  }

  @Test
  fun `error was logged on exception`() {

    communityAPIClient = CommunityAPIClient(
      WebClient.builder().exchangeFunction(exchangeFunction).build()
    )
    whenever(exchangeFunction.exchange(any())).thenThrow(RuntimeException::class.java)

    communityAPIClient.makeAsyncPostRequest("/uriValue", referralSentEvent)

    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("ERROR")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Call to community api failed")
  }

  private val referralSentEvent = ReferralEvent(
    "source",
    ReferralEventType.SENT,
    SampleData.sampleReferral(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
      crn = "X123456",
      relevantSentenceId = 123456,
      serviceProviderName = "Harmony Living",
      sentAt = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 0, ZoneOffset.of("+00:00"))
    ),
    "http://url"
  )
}
