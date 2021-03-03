package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.slf4j.LoggerFactory
import org.springframework.aop.aspectj.MethodInvocationProceedingJoinPoint
import org.springframework.stereotype.Component

@Aspect
@Component
class AsyncEventExceptionAdvice {

  @Around(value = "@annotation(AsyncEventExceptionHandling)")
  fun handleException(pjp: ProceedingJoinPoint) {
    try {
      pjp.proceed()
    } catch (exception: Throwable) {
      val event = (pjp as MethodInvocationProceedingJoinPoint).args.getOrNull(0)
      log.error("Exception thrown for method annotated with @AsyncEventExceptionHandling: [$event]", exception)
    }
  }

  companion object {
    private val log = LoggerFactory.getLogger(AsyncEventExceptionAdvice::class.java)
  }
}
