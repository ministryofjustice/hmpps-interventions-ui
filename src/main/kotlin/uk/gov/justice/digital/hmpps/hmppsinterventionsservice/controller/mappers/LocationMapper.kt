package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers

import org.springframework.stereotype.Component
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.net.URI
import java.util.UUID

@Component
class LocationMapper {

  fun map(path: String, id: UUID): URI {
    return ServletUriComponentsBuilder.fromCurrentRequest().path(path).buildAndExpand(id).toUri()
  }
}
