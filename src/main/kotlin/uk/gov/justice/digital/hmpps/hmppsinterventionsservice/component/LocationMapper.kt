package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.stereotype.Component
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.net.URI
import java.util.UUID

@Component
class LocationMapper {

  fun mapToCurrentRequestBasePath(path: String, id: UUID): URI {
    return mapToCurrentRequestBaseAsUriComponents(path, id).toUri()
  }

  fun mapToCurrentRequestBasePathAsString(path: String, id: UUID): String {
    return mapToCurrentRequestBaseAsUriComponents(path, id).toUriString()
  }

  private fun mapToCurrentRequestBaseAsUriComponents(path: String, id: UUID) =
    ServletUriComponentsBuilder.fromCurrentRequest().path(path).buildAndExpand(id)
}
