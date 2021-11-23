package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.springframework.aop.aspectj.MethodInvocationProceedingJoinPoint
import org.springframework.context.ApplicationEvent

internal class AsyncEventExceptionAdviceTest {
  private class TestEvent(source: Any) : ApplicationEvent(source)

  private val methodInvocationProceedingJoinPoint = mock<MethodInvocationProceedingJoinPoint>()
  private val event = TestEvent(this)
  private val originalException = RuntimeException("Stuff is bad")
  private val asyncEventExceptionAdvice = AsyncEventExceptionAdvice()

  @Test
  fun `rethrows exception when exception occurs with event context`() {
    whenever(methodInvocationProceedingJoinPoint.proceed()).thenThrow(originalException)
    whenever(methodInvocationProceedingJoinPoint.args).thenReturn(arrayOf(event))

    val raisedException = assertThrows<EventException> {
      asyncEventExceptionAdvice.handleException(methodInvocationProceedingJoinPoint)
    }
    assertThat(raisedException.message).isEqualTo("RuntimeException: Stuff is bad; while processing TestEvent")
    assertThat(raisedException.event).isEqualTo(event)
  }

  @Test
  fun `does not throw exception on normal execution`() {
    whenever(methodInvocationProceedingJoinPoint.args).thenReturn(arrayOf(event))

    assertDoesNotThrow {
      asyncEventExceptionAdvice.handleException(methodInvocationProceedingJoinPoint)
    }
  }
}
