package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.stereotype.Component
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.net.URI

@Component
class LocationMapper {
  fun expandPathToCurrentRequestBaseUrl(path: String, vararg uriVariableValues: Any): URI {
    return ServletUriComponentsBuilder.fromCurrentRequestUri().path(path).buildAndExpand(*uriVariableValues).toUri()
  }
}
