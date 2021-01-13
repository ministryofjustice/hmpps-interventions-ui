package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import com.fasterxml.jackson.annotation.JsonInclude
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.server.ResponseStatusException

enum class Code {
  FIELD_CANNOT_BE_CHANGED,
  DATE_MUST_BE_IN_THE_FUTURE,
  SERVICE_CATEGORY_MUST_BE_SET,
  CONDITIONAL_FIELD_MUST_BE_SET,
  CANNOT_BE_EMPTY
}

data class FieldError(
  val field: String,
  val error: Code,
)

class ValidationError(override val message: String, val errors: List<FieldError>) : RuntimeException(message)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ErrorResponse(
  val status: Int,
  val error: String,
  val message: String?,
  val validationErrors: List<FieldError>? = null,
)

@RestControllerAdvice
class ErrorConfiguration {
  @ExceptionHandler(ValidationError::class)
  fun handleValidationException(e: ValidationError): ResponseEntity<ErrorResponse> {
    log.info("validation exception: {}", e.message)
    return ResponseEntity
      .status(HttpStatus.BAD_REQUEST)
      .body(
        ErrorResponse(
          status = HttpStatus.BAD_REQUEST.value(),
          error = "validation error",
          message = e.message,
          validationErrors = e.errors,
        )
      )
  }

  @ExceptionHandler(ResponseStatusException::class)
  fun handleResponseException(e: ResponseStatusException): ResponseEntity<ErrorResponse> {
    log.info("internal exception: {}", e.message)
    return ResponseEntity
      .status(e.status)
      .body(
        ErrorResponse(
          status = e.status.value(),
          error = e.status.reasonPhrase,
          message = e.reason,
        )
      )
  }

  @ExceptionHandler(java.lang.Exception::class)
  fun handleException(e: java.lang.Exception): ResponseEntity<ErrorResponse?>? {
    log.error("unexpected exception: {}", e)
    return ResponseEntity
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .body(
        ErrorResponse(
          status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
          error = "unexpected error",
          message = e.message,
        )
      )
  }

  companion object {
    private val log = LoggerFactory.getLogger(ErrorConfiguration::class.java)
  }
}
