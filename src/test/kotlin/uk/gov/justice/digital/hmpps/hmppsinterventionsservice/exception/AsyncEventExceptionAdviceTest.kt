package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.aop.aspectj.MethodInvocationProceedingJoinPoint
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.org.lidalia.slf4jtest.TestLogger
import uk.org.lidalia.slf4jtest.TestLoggerFactory

internal class AsyncEventExceptionAdviceTest {

  private val methodInvocationProceedingJoinPoint = mock<MethodInvocationProceedingJoinPoint>()

  private lateinit var asyncEventExceptionAdvice: AsyncEventExceptionAdvice

  @AfterEach
  fun teardown() {
    TestLoggerFactory.clear()
  }

  @Test
  fun `exception is logged when thrown`() {
    val logger: TestLogger = TestLoggerFactory.getTestLogger(AsyncEventExceptionAdvice::class.java)
    asyncEventExceptionAdvice = AsyncEventExceptionAdvice()

    whenever(methodInvocationProceedingJoinPoint.proceed()).thenThrow(RuntimeException())
    whenever(methodInvocationProceedingJoinPoint.args).thenReturn(arrayOf(SampleData.sampleNPSRegion()))

    asyncEventExceptionAdvice.handleException(methodInvocationProceedingJoinPoint)

    Assertions.assertThat(logger.loggingEvents.size).isEqualTo(1)
    Assertions.assertThat(logger.loggingEvents[0].level.name).isEqualTo("ERROR")
    Assertions.assertThat(logger.loggingEvents[0].message).isEqualTo("Exception thrown for method annotated with @AsyncEventExceptionHandling: [NPSRegion(id=G, name=South West)]")
  }

  @Test
  fun `not logged when exception is not thrown`() {
    val logger: TestLogger = TestLoggerFactory.getTestLogger(AsyncEventExceptionAdvice::class.java)
    asyncEventExceptionAdvice = AsyncEventExceptionAdvice()

    asyncEventExceptionAdvice.handleException(methodInvocationProceedingJoinPoint)

    Assertions.assertThat(logger.loggingEvents.size).isEqualTo(0)
  }
}
