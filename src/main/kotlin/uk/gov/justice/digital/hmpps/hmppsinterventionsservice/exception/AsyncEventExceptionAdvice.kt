package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import io.sentry.Sentry
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.springframework.aop.aspectj.MethodInvocationProceedingJoinPoint
import org.springframework.context.ApplicationEvent
import org.springframework.stereotype.Component

class EventException(val event: ApplicationEvent, cause: Throwable) : RuntimeException(cause) {
  override val message: String
    get() = "${cause?.javaClass?.simpleName}: ${cause?.message}; while processing ${eventName()}"

  private fun eventName(): String = event.javaClass.simpleName
}

@Aspect
@Component
class AsyncEventExceptionAdvice {
  @Around(value = "@annotation(AsyncEventExceptionHandling)")
  fun handleException(pjp: ProceedingJoinPoint) {
    try {
      pjp.proceed()
    } catch (exception: Throwable) {
      val event = (pjp as MethodInvocationProceedingJoinPoint).args.getOrNull(0) as ApplicationEvent
      Sentry.setExtra("async-event", event.toString())
      throw EventException(event, exception)
    }
  }
}
