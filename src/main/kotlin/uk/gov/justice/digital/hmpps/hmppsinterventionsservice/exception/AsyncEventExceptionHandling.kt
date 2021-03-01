package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception

import kotlin.annotation.AnnotationRetention.RUNTIME
import kotlin.annotation.AnnotationTarget.FUNCTION

@Target(FUNCTION)
@Retention(RUNTIME)
annotation class AsyncEventExceptionHandling
