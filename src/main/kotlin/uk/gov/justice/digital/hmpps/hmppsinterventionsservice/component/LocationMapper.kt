package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.lang.RuntimeException
import java.net.URI
import kotlin.reflect.KFunction
import kotlin.reflect.full.findAnnotation

@Component
class LocationMapper {
  fun expandPathToCurrentRequestBaseUrl(path: String, vararg uriVariableValues: Any): URI {
    return ServletUriComponentsBuilder.fromCurrentRequestUri().path(path).buildAndExpand(*uriVariableValues).toUri()
  }

  fun getPathFromControllerMethod(method: KFunction<*>): String {
    val annotation = method.findAnnotation<GetMapping>()
      ?: throw RuntimeException("method '${method.name}' does not have a GetMapping annotation")
    return annotation.value.first()
  }
}
