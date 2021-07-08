package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.LoggerContext
import com.fasterxml.jackson.databind.ObjectMapper
import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus.BAD_REQUEST
import org.springframework.http.HttpStatus.OK
import org.springframework.web.reactive.function.client.ClientRequest
import org.springframework.web.reactive.function.client.ClientResponse
import org.springframework.web.reactive.function.client.ExchangeFunction
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception.CommunityApiCallError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentCreateRequestDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentResponseDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingMemoryAppender
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIClientTest {

  private val exchangeFunction = mock<ExchangeFunction>()
  private val objectMapper = ObjectMapper()
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
  fun `makes async post request successfully`() {

    communityAPIClient = CommunityAPIClient(
      RestClient(WebClient.builder().exchangeFunction(exchangeFunction).build(), "client-registration-id"),
      objectMapper
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
  fun `makes async patch request successfully`() {

    communityAPIClient = CommunityAPIClient(
      RestClient(WebClient.builder().exchangeFunction(exchangeFunction).build(), "client-registration-id"),
      objectMapper
    )
    whenever(exchangeFunction.exchange(any())).thenReturn(Mono.empty())

    communityAPIClient.makeAsyncPatchRequest("/uriValue", referralSentEvent)

    verify(exchangeFunction, times(1)).exchange(any())
    val requestCaptor = argumentCaptor<ClientRequest>()
    verify(exchangeFunction).exchange(requestCaptor.capture())
    val requestDetails = requestCaptor.firstValue

    assertThat("/uriValue").isEqualTo(requestDetails.url().toString())
  }

  @Test
  fun `error was logged on exception during async post request`() {

    communityAPIClient = CommunityAPIClient(
      RestClient(WebClient.builder().exchangeFunction(exchangeFunction).build(), "client-registration-id"),
      objectMapper
    )
    whenever(exchangeFunction.exchange(any())).thenThrow(RuntimeException("An error"))

    communityAPIClient.makeAsyncPostRequest("/uriValue", referralSentEvent)

    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("ERROR")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Call to downstream api failed [An error]")
  }

  @Test
  fun `makes sync post request successfully`() {

    communityAPIClient = CommunityAPIClient(
      RestClient(WebClient.builder().exchangeFunction(exchangeFunction).build(), "client-registration-id"),
      objectMapper
    )
    val clientResponse: ClientResponse = ClientResponse
      .create(OK)
      .header("Content-Type", "application/json")
      .body("{\"appointmentId\":\"1234\"}")
      .build()
    whenever(exchangeFunction.exchange(any())).thenReturn(Mono.just(clientResponse))

    val response = communityAPIClient.makeSyncPostRequest("/uriValue", appointmentCreateRequest, AppointmentResponseDTO::class.java)

    assertThat(response.appointmentId).isEqualTo(1234L)

    verify(exchangeFunction, times(1)).exchange(any())
    val requestCaptor = argumentCaptor<ClientRequest>()
    verify(exchangeFunction).exchange(requestCaptor.capture())
    val requestDetails = requestCaptor.firstValue

    assertThat("/uriValue").isEqualTo(requestDetails.url().toString())
  }

  @Test
  fun `error was logged on exception during sync post request`() {

    communityAPIClient = CommunityAPIClient(
      RestClient(WebClient.builder().exchangeFunction(exchangeFunction).build(), "client-registration-id"),
      objectMapper
    )
    whenever(exchangeFunction.exchange(any())).thenThrow(RuntimeException("A problem"))

    val exception = Assertions.assertThrows(RuntimeException::class.java) {
      communityAPIClient.makeSyncPostRequest("/uriValue", appointmentCreateRequest, AppointmentResponseDTO::class.java)
    }
    assertThat(exception.localizedMessage).isEqualTo("java.lang.RuntimeException: A problem")

    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("ERROR")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Call to downstream api failed [A problem]")
  }

  @Test
  fun `propagates error response body on exception during sync post request`() {

    communityAPIClient = CommunityAPIClient(
      RestClient(WebClient.builder().exchangeFunction(exchangeFunction).build(), "client-registration-id"),
      objectMapper
    )
    val clientResponse: ClientResponse = ClientResponse
      .create(BAD_REQUEST)
      .header("Content-Type", "application/json")
      .body("There was a problem Houston")
      .build()
    whenever(exchangeFunction.exchange(any())).thenReturn(Mono.just(clientResponse))

    val exception = Assertions.assertThrows(CommunityApiCallError::class.java) {
      communityAPIClient.makeSyncPostRequest("/uriValue", appointmentCreateRequest, AppointmentResponseDTO::class.java)
    }
    assertThat(exception.localizedMessage).isEqualTo("org.springframework.web.reactive.function.client.WebClientResponseException\$BadRequest: 400 Bad Request from UNKNOWN ")
    assertThat(exception.httpStatus).isEqualTo(BAD_REQUEST)
    assertThat(exception.category).isEqualTo("There was a problem Houston")
    assertThat(exception.userMessage).isEqualTo("Delius reported \"There was a problem Houston\". Please correct, if possible, otherwise contact support")
    assertThat(exception.responseBody).isEqualTo("There was a problem Houston")

    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("ERROR")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Call to downstream api failed [There was a problem Houston]")
  }

  @Test
  fun `propagates user message on exception during sync post request`() {

    communityAPIClient = CommunityAPIClient(
      RestClient(WebClient.builder().exchangeFunction(exchangeFunction).build(), "client-registration-id"),
      objectMapper
    )
    val clientResponse: ClientResponse = ClientResponse
      .create(BAD_REQUEST)
      .header("Content-Type", "application/json")
      .body("{\"userMessage\":\"CRN X123456, there was a problem on requirement 123456\",\"developerMessage\":\"None\"}")
      .build()
    whenever(exchangeFunction.exchange(any())).thenReturn(Mono.just(clientResponse))

    val exception = Assertions.assertThrows(CommunityApiCallError::class.java) {
      communityAPIClient.makeSyncPostRequest("/uriValue", appointmentCreateRequest, AppointmentResponseDTO::class.java)
    }
    assertThat(exception.localizedMessage).isEqualTo("org.springframework.web.reactive.function.client.WebClientResponseException\$BadRequest: 400 Bad Request from UNKNOWN ")
    assertThat(exception.httpStatus).isEqualTo(BAD_REQUEST)
    assertThat(exception.category).isEqualTo("CRN _, there was a problem on requirement _")
    assertThat(exception.userMessage).isEqualTo("Delius reported \"CRN _, there was a problem on requirement _\". Please correct, if possible, otherwise contact support")
    assertThat(exception.responseBody).isEqualTo("{\"userMessage\":\"CRN X123456, there was a problem on requirement 123456\",\"developerMessage\":\"None\"}")

    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("ERROR")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Call to downstream api failed [CRN _, there was a problem on requirement _]")
  }

  @Test
  fun `propagates developer message on exception during sync post request`() {

    communityAPIClient = CommunityAPIClient(
      RestClient(WebClient.builder().exchangeFunction(exchangeFunction).build(), "client-registration-id"),
      objectMapper
    )
    val clientResponse: ClientResponse = ClientResponse
      .create(BAD_REQUEST)
      .header("Content-Type", "application/json")
      .body("{\"developerMessage\":\"Sentence '123456', there was a problem\"}")
      .build()
    whenever(exchangeFunction.exchange(any())).thenReturn(Mono.just(clientResponse))

    val exception = Assertions.assertThrows(CommunityApiCallError::class.java) {
      communityAPIClient.makeSyncPostRequest("/uriValue", appointmentCreateRequest, AppointmentResponseDTO::class.java)
    }
    assertThat(exception.localizedMessage).isEqualTo("org.springframework.web.reactive.function.client.WebClientResponseException\$BadRequest: 400 Bad Request from UNKNOWN ")
    assertThat(exception.httpStatus).isEqualTo(BAD_REQUEST)
    assertThat(exception.category).isEqualTo("Sentence '_', there was a problem")
    assertThat(exception.userMessage).isEqualTo("Delius reported \"Sentence '_', there was a problem\". Please correct, if possible, otherwise contact support")
    assertThat(exception.responseBody).isEqualTo("{\"developerMessage\":\"Sentence '123456', there was a problem\"}")

    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("ERROR")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Call to downstream api failed [Sentence '_', there was a problem]")
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

  private val appointmentCreateRequest = AppointmentCreateRequestDTO(
    contractType = "ACC",
    referralStart = OffsetDateTime.now(),
    referralId = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
    appointmentStart = OffsetDateTime.now(),
    appointmentEnd = OffsetDateTime.now(),
    officeLocationCode = "CRSEXTL",
    notes = "http://backLink",
    countsTowardsRarDays = true,
  )
}
