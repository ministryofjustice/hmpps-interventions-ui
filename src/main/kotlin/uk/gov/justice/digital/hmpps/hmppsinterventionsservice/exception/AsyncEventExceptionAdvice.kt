package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import mu.KLogging
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.springframework.aop.aspectj.MethodInvocationProceedingJoinPoint
import org.springframework.stereotype.Component

@Aspect
@Component
class AsyncEventExceptionAdvice {
  companion object : KLogging()

  @Around(value = "@annotation(AsyncEventExceptionHandling)")
  fun handleException(pjp: ProceedingJoinPoint) {
    try {
      pjp.proceed()
    } catch (exception: Throwable) {
      val event = (pjp as MethodInvocationProceedingJoinPoint).args.getOrNull(0)
      logger.error("Exception thrown for method annotated with @AsyncEventExceptionHandling: [$event]", exception)
    }
  }
}
