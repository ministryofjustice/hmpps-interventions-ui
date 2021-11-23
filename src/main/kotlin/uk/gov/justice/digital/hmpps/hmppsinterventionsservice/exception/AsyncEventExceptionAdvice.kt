package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.springframework.stereotype.Component

@Aspect
@Component
class AsyncEventExceptionAdvice {
  @Around(value = "@annotation(AsyncEventExceptionHandling)")
  fun handleException(pjp: ProceedingJoinPoint) {
    try {
      pjp.proceed()
    } catch (exception: Throwable) {
      throw exception
    }
  }
}
