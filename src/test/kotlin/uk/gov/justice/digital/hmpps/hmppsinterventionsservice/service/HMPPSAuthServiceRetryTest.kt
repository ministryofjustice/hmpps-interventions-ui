package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import ch.qos.logback.classic.Level.DEBUG
import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.LoggerContext
import io.netty.channel.ConnectTimeoutException
import io.netty.handler.timeout.ReadTimeoutException
import io.netty.handler.timeout.ReadTimeoutHandler
import io.netty.handler.timeout.WriteTimeoutHandler
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import okhttp3.mockwebserver.SocketPolicy.NO_RESPONSE
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.client.reactive.ReactorClientHttpConnector
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientRequestException
import reactor.netty.http.client.HttpClient
import reactor.util.context.Context
import reactor.util.context.ContextView
import reactor.util.retry.Retry.RetrySignal
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.RestClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingMemoryAppender
import java.net.URI
import java.time.Duration
import java.util.concurrent.TimeUnit.SECONDS

class HMPPSAuthServiceRetryTest {

  private val userDetailBody = """
        { "email": "tom@tom.tom", "verified": true, "firstName": "tom", "lastName": "tom" }
  """.trimIndent()

  private val orgForUserBody = """[
        { "groupCode": "NPS_N0", "groupName": "NPS North East" },
        { "groupCode": "INT_SP_HARMONY_LIVING", "groupName": "Harmony Living" },
        { "groupCode": "INT_SP_NEW_BEGINNINGS", "groupName": "New Beginnings" }]
  """.trimIndent()

  val emailBody = """
        { "email": "tom@tom.tom" }
  """.trimIndent()

  private val mockWebServer = MockWebServer()
  private val httpClient = HttpClient.create()
    .doOnConnected {
      it
        .addHandlerLast(ReadTimeoutHandler(2))
        .addHandlerLast(WriteTimeoutHandler(2))
    }
    .responseTimeout(Duration.ofSeconds(2))
  private val webClient = WebClient.builder()
    .baseUrl(mockWebServer.url("/").toString())
    .clientConnector(ReactorClientHttpConnector(httpClient))
    .build()
  private lateinit var hmppsAuthService: HMPPSAuthService

  companion object {
    private val logger = LoggerFactory.getLogger(HMPPSAuthService::class.java) as Logger
    private var memoryAppender = LoggingMemoryAppender()

    @BeforeAll
    @JvmStatic
    fun setupAll() {
      memoryAppender.context = LoggerFactory.getILoggerFactory() as LoggerContext
      logger.level = DEBUG
      logger.addAppender(memoryAppender)
      memoryAppender.start()
    }

    @AfterAll
    @JvmStatic
    fun teardownAll() {
      logger.detachAppender(memoryAppender)
    }
  }

  @BeforeEach
  fun setUp() {
    hmppsAuthService = HMPPSAuthService(
      "/authuser/groups",
      "/authuser/detail",
      "/user/email",
      "/user/detail",
      2L,
      RestClient(webClient, "client-registration-id")
    )
  }

  @AfterEach
  fun teardown() {
    memoryAppender.reset()
  }

  @Test
  fun `getUserDetail for auth user when no response`() {
    mockWebServer.enqueue(MockResponse().setSocketPolicy(NO_RESPONSE))

    val exception = assertThrows<IllegalStateException> {
      hmppsAuthService.getUserDetail(AuthUser("id", "auth", "username"))
    }

    assertThat(exception.javaClass.canonicalName).isEqualTo("reactor.core.Exceptions.RetryExhaustedException")
    assertThat(exception.message).isEqualTo("Retries exhausted: 2/2")
  }

  @Test
  fun `getUserDetail auth user when response delayed on all attempts`() {
    mockWebServer.enqueue(MockResponse().setBody(userDetailBody).setHeadersDelay(3, SECONDS))
    mockWebServer.enqueue(MockResponse().setBody(userDetailBody).setHeadersDelay(3, SECONDS))
    mockWebServer.enqueue(MockResponse().setBody(userDetailBody).setHeadersDelay(3, SECONDS))

    val exception = assertThrows<IllegalStateException> {
      hmppsAuthService.getUserDetail(AuthUser("id", "auth", "username"))
    }

    assertThat(exception.javaClass.canonicalName).isEqualTo("reactor.core.Exceptions.RetryExhaustedException")
    assertThat(exception.message).isEqualTo("Retries exhausted: 2/2")
  }

  @Test
  fun `getUserDetail auth user when response delayed on all but last`() {
    mockWebServer.enqueue(MockResponse().setBody(userDetailBody).setHeadersDelay(3, SECONDS))
    mockWebServer.enqueue(MockResponse().setBody(userDetailBody).setHeadersDelay(3, SECONDS))
    mockWebServer.enqueue(MockResponse().setBody(userDetailBody).setHeadersDelay(1, SECONDS).setHeader("content-type", "application/json"))

    val response = hmppsAuthService.getUserDetail(AuthUser("id", "auth", "username"))

    assertThat(mockWebServer.takeRequest().path).isEqualTo("/authuser/detail")
    assertThat(response.email).isEqualTo("tom@tom.tom")
    assertThat(response.firstName).isEqualTo("tom")
  }

  @Test
  fun `getUserDetail auth user when response not delayed on first attempt`() {
    mockWebServer.enqueue(MockResponse().setBody(userDetailBody).setHeadersDelay(1, SECONDS).setHeader("content-type", "application/json"))

    val response = hmppsAuthService.getUserDetail(AuthUser("id", "auth", "username"))

    assertThat(mockWebServer.takeRequest().path).isEqualTo("/authuser/detail")
    assertThat(response.email).isEqualTo("tom@tom.tom")
    assertThat(response.firstName).isEqualTo("tom")
  }

  @Test
  fun `getUserDetail fails for unverified auth user when no response`() {
    mockWebServer.enqueue(MockResponse().setSocketPolicy(NO_RESPONSE))

    val exception = assertThrows<IllegalStateException> {
      hmppsAuthService.getUserDetail(AuthUser("id", "delius", "username"))
    }

    assertThat(exception.javaClass.canonicalName).isEqualTo("reactor.core.Exceptions.RetryExhaustedException")
    assertThat(exception.message).isEqualTo("Retries exhausted: 2/2")
  }

  @Test
  fun `getUserDetail for delius user when no response`() {
    mockWebServer.dispatcher = object : Dispatcher() {
      override fun dispatch(request: RecordedRequest): MockResponse {
        return when (request.path) {
          "/user/email" -> {
            MockResponse()
              .setHeader("content-type", "application/json")
              .setBody(
                emailBody
              )
          }
          "/user/detail" ->
            MockResponse().setSocketPolicy(NO_RESPONSE)
          else -> MockResponse().setResponseCode(404)
        }
      }
    }

    val exception = assertThrows<IllegalStateException> {
      hmppsAuthService.getUserDetail(AuthUser("id", "delius", "username"))
    }

    assertThat(exception.javaClass.canonicalName).isEqualTo("reactor.core.Exceptions.RetryExhaustedException")
    assertThat(exception.message).isEqualTo("Retries exhausted: 2/2")
  }

  @Test
  fun `getUserGroups when no response`() {
    mockWebServer.enqueue(MockResponse().setSocketPolicy(NO_RESPONSE))

    val exception = assertThrows<IllegalStateException> {
      hmppsAuthService.getUserGroups(AuthUser("id", "delius", "username"))
    }

    assertThat(exception.javaClass.canonicalName).isEqualTo("reactor.core.Exceptions.RetryExhaustedException")
    assertThat(exception.message).isEqualTo("Retries exhausted: 2/2")
  }

  @Test
  fun `isTimeout determines relevant exception`() {
    assertThat(hmppsAuthService.isTimeoutException(ReadTimeoutException.INSTANCE)).isTrue
    assertThat(hmppsAuthService.isTimeoutException(ConnectTimeoutException("Connection timeout"))).isTrue
    assertThat(hmppsAuthService.isTimeoutException(RuntimeException())).isFalse
  }

  @Test
  fun `isTimeout determines relevant exception when wrapped in web client request exception`() {
    assertThat(hmppsAuthService.isTimeoutException(WebClientRequestException(ReadTimeoutException.INSTANCE, HttpMethod.GET, URI("/"), HttpHeaders.EMPTY))).isTrue
    assertThat(hmppsAuthService.isTimeoutException(WebClientRequestException(ConnectTimeoutException("Connection timeout"), HttpMethod.GET, URI("/"), HttpHeaders.EMPTY))).isTrue
    assertThat(hmppsAuthService.isTimeoutException(WebClientRequestException(RuntimeException(), HttpMethod.GET, URI("/"), HttpHeaders.EMPTY))).isFalse
  }

  @Test
  fun `log debug timeout`() {
    val retrySignal = TestRetrySignal(1, 2, ReadTimeoutException.INSTANCE)

    hmppsAuthService.logRetrySignal(retrySignal)

    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("DEBUG")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Retrying due to [io.netty.handler.timeout.ReadTimeoutException]")
    assertThat(memoryAppender.logEvents[0].argumentArray[0].toString()).isEqualTo("io.netty.handler.timeout.ReadTimeoutException")
    assertThat(memoryAppender.logEvents[0].argumentArray[1].toString()).isEqualTo("res.causeMessage=io.netty.handler.timeout.ReadTimeoutException")
    assertThat(memoryAppender.logEvents[0].argumentArray[2].toString()).isEqualTo("totalRetries=1")
  }

  @Test
  fun `log debug timeout for wrapped exception`() {
    val retrySignal = TestRetrySignal(1, 2, WebClientRequestException(ReadTimeoutException.INSTANCE, HttpMethod.GET, URI("/"), HttpHeaders.EMPTY))

    hmppsAuthService.logRetrySignal(retrySignal)

    assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("DEBUG")
    assertThat(memoryAppender.logEvents[0].message).isEqualTo("Retrying due to [io.netty.handler.timeout.ReadTimeoutException]")
    assertThat(memoryAppender.logEvents[0].argumentArray[0].toString()).isEqualTo("io.netty.handler.timeout.ReadTimeoutException")
    assertThat(memoryAppender.logEvents[0].argumentArray[1].toString()).isEqualTo("res.causeMessage=io.netty.handler.timeout.ReadTimeoutException")
    assertThat(memoryAppender.logEvents[0].argumentArray[2].toString()).isEqualTo("totalRetries=1")
  }
}

class TestRetrySignal constructor(
  private val failureTotalIndex: Long,
  private val failureSubsequentIndex: Long,
  private val failure: Throwable,
  private val retryContext: ContextView = Context.empty()
) : RetrySignal {

  override fun totalRetries(): Long {
    return failureTotalIndex
  }

  override fun totalRetriesInARow(): Long {
    return failureSubsequentIndex
  }

  override fun failure(): Throwable {
    return failure
  }

  override fun retryContextView(): ContextView {
    return retryContext
  }

  override fun copy(): RetrySignal {
    return this
  }
}
