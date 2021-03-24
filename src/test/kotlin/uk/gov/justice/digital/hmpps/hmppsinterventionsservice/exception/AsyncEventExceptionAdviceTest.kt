package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import ch.qos.logback.classic.Logger
import ch.qos.logback.classic.LoggerContext
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.slf4j.LoggerFactory
import org.springframework.aop.aspectj.MethodInvocationProceedingJoinPoint
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.LoggingMemoryAppender

internal class AsyncEventExceptionAdviceTest {

  private val methodInvocationProceedingJoinPoint = mock<MethodInvocationProceedingJoinPoint>()

  private lateinit var asyncEventExceptionAdvice: AsyncEventExceptionAdvice

  companion object {
    private val logger = LoggerFactory.getLogger(AsyncEventExceptionAdvice::class.java) as Logger
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
  fun `exception is logged when thrown`() {
    asyncEventExceptionAdvice = AsyncEventExceptionAdvice()

    whenever(methodInvocationProceedingJoinPoint.proceed()).thenThrow(RuntimeException())
    whenever(methodInvocationProceedingJoinPoint.args).thenReturn(arrayOf(SampleData.sampleNPSRegion()))

    asyncEventExceptionAdvice.handleException(methodInvocationProceedingJoinPoint)

    Assertions.assertThat(memoryAppender.logEvents.size).isEqualTo(1)
    Assertions.assertThat(memoryAppender.logEvents[0].level.levelStr).isEqualTo("ERROR")
    Assertions.assertThat(memoryAppender.logEvents[0].message).isEqualTo("Exception thrown for method annotated with @AsyncEventExceptionHandling {}")
    Assertions.assertThat(memoryAppender.logEvents[0].argumentArray[1].toString()).isEqualTo("event=NPSRegion(id=G, name=South West)")
  }

  @Test
  fun `not logged when exception is not thrown`() {
    asyncEventExceptionAdvice = AsyncEventExceptionAdvice()

    asyncEventExceptionAdvice.handleException(methodInvocationProceedingJoinPoint)

    Assertions.assertThat(memoryAppender.logEvents.size).isEqualTo(0)
  }
}
