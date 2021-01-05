package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import me.alidg.errors.HttpError
import me.alidg.errors.WebErrorHandlerPostProcessor
import me.alidg.errors.annotation.ExceptionMapping
import me.alidg.errors.annotation.ExposeAsArg
import org.slf4j.LoggerFactory
import org.springframework.context.MessageSource
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.support.ReloadableResourceBundleMessageSource
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Component
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean
import java.util.UUID

@ExceptionMapping(statusCode = HttpStatus.BAD_REQUEST, errorCode = "referral.malformed_id")
class ReferralBadIDException(@ExposeAsArg(name = "id") private val id: String) : RuntimeException()

@ExceptionMapping(statusCode = HttpStatus.NOT_FOUND, errorCode = "referral.not_found")
class ReferralNotFoundException(@ExposeAsArg(name = "id") private val id: UUID) : RuntimeException()

@ExceptionMapping(statusCode = HttpStatus.NOT_FOUND, errorCode = "service_category.not_found")
class ServiceCategoryNotFoundException(@ExposeAsArg(name = "id") private val id: UUID) : RuntimeException()

@Component
class LoggingErrorWebErrorHandlerPostProcessor : WebErrorHandlerPostProcessor {
  override fun process(error: HttpError) {
    when {
      error.httpStatus.is4xxClientError() -> log.info(prepareMessage(error))
      error.httpStatus.is5xxServerError() -> log.error(prepareMessage(error))
    }
  }

  private fun prepareMessage(error: HttpError): String? {
    return error.errors.map { "${it.message} ${it.arguments.joinToString(" ")}" }.joinToString("; ")
  }

  companion object {
    private val log = LoggerFactory.getLogger(LoggingErrorWebErrorHandlerPostProcessor::class.java)
  }
}

@Configuration
class ErrorsConfiguration {
  @Bean
  fun messageSource(): MessageSource? {
    val messageSource = ReloadableResourceBundleMessageSource()
    messageSource.setBasename("classpath:errors")
    messageSource.setDefaultEncoding("UTF-8")
    return messageSource
  }

  @Bean
  fun getValidator(): LocalValidatorFactoryBean? {
    val bean = LocalValidatorFactoryBean()
    bean.setValidationMessageSource(messageSource())
    return bean
  }
}
