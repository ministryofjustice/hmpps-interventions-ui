package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.stereotype.Component
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.net.URI
import java.util.UUID

@Component
class LocationMapper {

  fun mapToCurrentRequestBasePath(path: String, id: UUID): URI {
    return ServletUriComponentsBuilder.fromCurrentRequest().path(path).buildAndExpand(id).toUri()
  }

  fun mapToCurrentContextPathAsString(path: String, id: UUID): String {
    return ServletUriComponentsBuilder.fromCurrentContextPath().path(path).buildAndExpand(id).toUriString()
  }
}
