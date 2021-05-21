package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import com.fasterxml.jackson.annotation.JsonInclude
import com.microsoft.applicationinsights.TelemetryClient
import mu.KLogging
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.web.reactive.function.client.WebClientResponseException
import org.springframework.web.server.ResponseStatusException
import javax.persistence.EntityExistsException
import javax.persistence.EntityNotFoundException

enum class Code {
  FIELD_CANNOT_BE_CHANGED,
  DATE_MUST_BE_IN_THE_FUTURE,
  SERVICE_CATEGORY_MUST_BE_SET,
  CONDITIONAL_FIELD_MUST_BE_SET,
  CANNOT_BE_EMPTY,
  CANNOT_BE_NEGATIVE_OR_ZERO,
  INVALID_SERVICE_CATEGORY_FOR_CONTRACT
}

data class FieldError(
  val field: String,
  val error: Code,
)

class ValidationError(override val message: String, val errors: List<FieldError>) : RuntimeException(message)

class AccessError(override val message: String, val errors: List<String>) : RuntimeException(message)

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ErrorResponse(
  val status: Int,
  val error: String,
  val message: String?,
  val validationErrors: List<FieldError>? = null,
  val accessErrors: List<String>? = null,
)

@RestControllerAdvice
class ErrorConfiguration(private val telemetryClient: TelemetryClient) {
  companion object : KLogging()

  @ExceptionHandler(AccessError::class)
  fun handleAccessError(e: AccessError): ResponseEntity<ErrorResponse> {
    return errorResponse(HttpStatus.FORBIDDEN, "access error", e.message, accessErrors = e.errors)
  }

  @ExceptionHandler(AccessDeniedException::class)
  fun handleAccessDeniedException(e: AccessDeniedException): ResponseEntity<ErrorResponse> {
    logger.info("access denied exception", e)
    return errorResponse(HttpStatus.FORBIDDEN, "access denied", e.message)
  }

  @ExceptionHandler(MethodArgumentTypeMismatchException::class)
  fun handleInvalidParamException(e: MethodArgumentTypeMismatchException): ResponseEntity<ErrorResponse> {
    logger.info("invalid parameter passed to controller method", e)
    return errorResponse(HttpStatus.BAD_REQUEST, "invalid parameter", e.message)
  }

  @ExceptionHandler(ValidationError::class)
  fun handleValidationException(e: ValidationError): ResponseEntity<ErrorResponse> {
    logger.info("validation exception", e)
    return errorResponse(HttpStatus.BAD_REQUEST, "validation error", e.message, validationErrors = e.errors)
  }

  @ExceptionHandler(ResponseStatusException::class)
  fun handleResponseException(e: ResponseStatusException): ResponseEntity<ErrorResponse> {
    logger.info("internal exception", e)
    return errorResponse(e.status, e.status.reasonPhrase, e.reason)
  }

  @ExceptionHandler(java.lang.Exception::class)
  fun handleException(e: java.lang.Exception): ResponseEntity<ErrorResponse> {
    logger.error("unexpected exception", e)
    telemetryClient.trackException(e)
    return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "unexpected error", e.message)
  }

  @ExceptionHandler(EntityNotFoundException::class)
  fun handleEntityNotFoundException(e: EntityNotFoundException): ResponseEntity<ErrorResponse> {
    logger.info("entity not found exception", e)
    return errorResponse(HttpStatus.NOT_FOUND, "entity not found", e.message)
  }

  @ExceptionHandler(EntityExistsException::class)
  fun handleEntityExistsException(e: EntityExistsException): ResponseEntity<ErrorResponse> {
    logger.info("entity exists exception", e)
    return errorResponse(HttpStatus.CONFLICT, "entity already exists", e.message)
  }

  @ExceptionHandler(WebClientResponseException::class)
  fun handleWebClientResponseException(e: WebClientResponseException): ResponseEntity<ErrorResponse> {
    logger.info("web client exception", e)
    return errorResponse(e.statusCode, "web client exception", e.responseBodyAsString)
  }

  private fun errorResponse(
    status: HttpStatus,
    summary: String,
    description: String?,
    validationErrors: List<FieldError>? = null,
    accessErrors: List<String>? = null,
  ): ResponseEntity<ErrorResponse> {
    return ResponseEntity
      .status(status)
      .body(
        ErrorResponse(
          status = status.value(),
          error = summary,
          message = description,
          validationErrors = validationErrors,
          accessErrors = accessErrors,
        )
      )
  }
}
