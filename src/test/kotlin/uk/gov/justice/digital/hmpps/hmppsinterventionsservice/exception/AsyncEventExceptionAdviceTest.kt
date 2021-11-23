package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.springframework.aop.aspectj.MethodInvocationProceedingJoinPoint
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.CreateCaseNoteEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.util.UUID

internal class AsyncEventExceptionAdviceTest {

  private val methodInvocationProceedingJoinPoint = mock<MethodInvocationProceedingJoinPoint>()
  private val event = CreateCaseNoteEvent(
    source = this,
    caseNoteId = UUID.randomUUID(),
    sentBy = SampleData.sampleAuthUser(),
    detailUrl = "fakeUrl",
    referralId = UUID.randomUUID(),
  )
  private val originalException = RuntimeException("Stuff is bad")
  private val asyncEventExceptionAdvice = AsyncEventExceptionAdvice()

  @Test
  fun `rethrows exception when exception occurs with event context`() {
    whenever(methodInvocationProceedingJoinPoint.proceed()).thenThrow(originalException)
    whenever(methodInvocationProceedingJoinPoint.args).thenReturn(arrayOf(event))

    val raisedException = assertThrows<RuntimeException> {
      asyncEventExceptionAdvice.handleException(methodInvocationProceedingJoinPoint)
    }
    assertThat(raisedException.message).isEqualTo("Stuff is bad")
  }

  @Test
  fun `does not throw exception on normal execution`() {
    whenever(methodInvocationProceedingJoinPoint.args).thenReturn(arrayOf(event))

    assertDoesNotThrow {
      asyncEventExceptionAdvice.handleException(methodInvocationProceedingJoinPoint)
    }
  }
}
