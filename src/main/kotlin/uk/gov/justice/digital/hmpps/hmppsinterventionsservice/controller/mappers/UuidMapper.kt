package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.web.server.ServerWebInputException
import java.util.UUID

fun parseID(id: String): UUID {
  return try {
    UUID.fromString(id)
  } catch (e: IllegalArgumentException) {
    throw ServerWebInputException("could not parse id [id=$id]")
  }
}
