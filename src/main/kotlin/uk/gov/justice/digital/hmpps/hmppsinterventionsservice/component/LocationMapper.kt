package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.stereotype.Component
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import org.springframework.web.util.UriComponents
import java.util.UUID

@Component
class LocationMapper {

  fun mapToCurrentRequestBasePath(path: String, id: UUID): UriComponents {
    return ServletUriComponentsBuilder.fromCurrentRequest().path(path).buildAndExpand(id)
  }

  fun mapToCurrentContextPathAsString(path: String, id: UUID): UriComponents {
    return ServletUriComponentsBuilder.fromCurrentContextPath().path(path).buildAndExpand(id)
  }
}
