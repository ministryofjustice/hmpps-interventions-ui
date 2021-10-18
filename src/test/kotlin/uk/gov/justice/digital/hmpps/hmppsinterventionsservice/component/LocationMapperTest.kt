package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import java.util.UUID

internal class LocationMapperTest {
  private val locationMapper = LocationMapper()
  private var request = MockHttpServletRequest()

  @BeforeEach
  fun setup() {
    request.clearAttributes()
    RequestContextHolder.setRequestAttributes(ServletRequestAttributes(request))
  }

  @Test
  fun `builds url by appending a path to the current request url and substitutes parameters`() {
    request.serverName = "localhost"
    request.serverPort = 8070
    request.requestURI = "/intervention"

    val id = UUID.fromString("a98d6ea3-357d-4910-9a43-fd383bf996c5")

    assertThat(locationMapper.expandPathToCurrentRequestUrl("/referral/{id}", id).toString())
      .isEqualTo("http://localhost:8070/intervention/referral/a98d6ea3-357d-4910-9a43-fd383bf996c5")

    assertThat(locationMapper.expandPathToCurrentRequestUrl("/referral/{id}/appointment/{appointment}", id, 123).toString())
      .isEqualTo("http://localhost:8070/intervention/referral/a98d6ea3-357d-4910-9a43-fd383bf996c5/appointment/123")

    assertThat(locationMapper.expandPathToCurrentRequestUrl("/referral/{id}/{resource}/{number}", id, "session", 4).toString())
      .isEqualTo("http://localhost:8070/intervention/referral/a98d6ea3-357d-4910-9a43-fd383bf996c5/session/4")
  }

  @Test
  fun `builds url by using the context of current request url, appending a path to the resource and substitutes parameters`() {
    request.serverName = "localhost"
    request.serverPort = 8070
    request.requestURI = "/intervention/action-plan/b843ddfe-9c32-4098-a0ed-5e317317ddc7"

    val id = UUID.fromString("b843ddfe-9c32-4098-a0ed-5e317317ddc7")

    assertThat(locationMapper.expandPathToCurrentContextPathUrl("/action-plan/{id}", id).toString())
      .isEqualTo("http://localhost:8070/action-plan/$id")

    assertThat(locationMapper.expandPathToCurrentContextPathUrl("/action-plan/{id}/session/{number}", id, 5).toString())
      .isEqualTo("http://localhost:8070/action-plan/$id/session/5")
  }

  @Test
  fun getPathFromControllerMethod() {
    @Controller
    class FooController {
      @GetMapping("/some/path/{id}")
      fun somePath(@PathVariable id: UUID) {}
    }

    assertThat(locationMapper.getPathFromControllerMethod(FooController::somePath)).isEqualTo("/some/path/{id}")
  }
}
