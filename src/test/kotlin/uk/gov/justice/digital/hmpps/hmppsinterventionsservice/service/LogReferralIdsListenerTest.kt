package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.LoggerContext
import net.logstash.logback.argument.StructuredArguments
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.mockito.kotlin.mock
import org.slf4j.LoggerFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingMemoryAppender
import java.time.OffsetDateTime
import java.util.UUID

internal class LogReferralIdsListenerTest {
  companion object {
    private val logger = LoggerFactory.getLogger(LogReferralIdsListener::class.java) as Logger
    private var memoryAppender = LoggingMemoryAppender()

    @BeforeAll
    @JvmStatic
    fun setupAll() {
      memoryAppender.context = LoggerFactory.getILoggerFactory() as LoggerContext
      logger.level = Level.DEBUG
      logger.addAppender(memoryAppender)
      memoryAppender.start()
    }

    @AfterAll
    @JvmStatic
    fun teardownAll() {
      logger.detachAppender(memoryAppender)
    }
  }

  @Test
  fun `sent referral event logs all identifiers so that we can look up other IDs by searching the logs`() {
    val id = UUID.fromString("abcdef00-1234-5678-90ab-ea4890c92ef6")
    val referenceNumber = "TE1234ST"
    val crn = "T123456"

    val referral = Referral(
      id = id,
      referenceNumber = referenceNumber,
      serviceUserCRN = crn,
      createdBy = mock(),
      createdAt = OffsetDateTime.now(),
      intervention = mock()
    )
    val sentEvent = ReferralEvent(
      this,
      ReferralEventType.SENT,
      referral,
      "irrelevant-for-this-test"
    )

    LogReferralIdsListener().onApplicationEvent(sentEvent)
    val lastLog = memoryAppender.logEvents.last()
    assertThat(lastLog.message).isEqualTo("new referral sent, reference numbers:")
    assertThat(lastLog.argumentArray.toList()).containsAll(
      listOf(
        StructuredArguments.kv("id", UUID.fromString("abcdef00-1234-5678-90ab-ea4890c92ef6")),
        StructuredArguments.kv("reference", "TE1234ST"),
        StructuredArguments.kv("crn", "T123456")
      )
    )
  }
}
