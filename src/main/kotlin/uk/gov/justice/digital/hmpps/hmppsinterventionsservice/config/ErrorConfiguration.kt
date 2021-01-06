package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus
import java.util.UUID

@ResponseStatus(value = HttpStatus.BAD_REQUEST)
class ReferralBadIDException(private val id: String) : RuntimeException("could not parse id [id=${id}]")

@ResponseStatus(value = HttpStatus.NOT_FOUND)
class ReferralNotFoundException(private val id: UUID) : RuntimeException("referral not found [id=${id}]")

@ResponseStatus(value = HttpStatus.NOT_FOUND)
class ServiceCategoryNotFoundException(private val id: UUID): RuntimeException("service category not found [id=${id}]")

