package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import ch.qos.logback.classic.Level
import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.LoggerContext
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.TestInstance
import org.slf4j.LoggerFactory
import kotlin.reflect.KClass

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
abstract class LoggingSpyTest(
  loggerClass: KClass<out Any>,
  private val level: Level,
) {
  private val logger = LoggerFactory.getLogger(loggerClass.java) as Logger
  private val memoryAppender = LoggingMemoryAppender()
  protected val logEvents get() = memoryAppender.logEvents

  @BeforeAll
  fun setupLoggerSpy() {
    memoryAppender.context = LoggerFactory.getILoggerFactory() as LoggerContext
    logger.level = level
    logger.addAppender(memoryAppender)
    memoryAppender.start()
  }

  @AfterAll
  fun teardownLoggerSpy() {
    logger.detachAppender(memoryAppender)
  }

  @AfterEach
  fun resetLoggerSpy() {
    memoryAppender.reset()
  }
}
