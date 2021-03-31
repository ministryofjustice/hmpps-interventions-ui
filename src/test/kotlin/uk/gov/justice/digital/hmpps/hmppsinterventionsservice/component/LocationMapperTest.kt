package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import java.util.UUID

internal class LocationMapperTest {
  private val locationMapper = LocationMapper()

  @BeforeEach
  fun setup() {
    val request = MockHttpServletRequest()
    RequestContextHolder.setRequestAttributes(ServletRequestAttributes(request))
  }

  @Test
  fun expandPathToCurrentRequestBaseUrl() {
    val id = UUID.fromString("a98d6ea3-357d-4910-9a43-fd383bf996c5")

    assertThat(locationMapper.expandPathToCurrentRequestBaseUrl("/intervention/{id}", id).toString())
      .isEqualTo("http://localhost/intervention/a98d6ea3-357d-4910-9a43-fd383bf996c5")

    assertThat(locationMapper.expandPathToCurrentRequestBaseUrl("/intervention/{id}/appointment/{appointment}", id, 123).toString())
      .isEqualTo("http://localhost/intervention/a98d6ea3-357d-4910-9a43-fd383bf996c5/appointment/123")

    assertThat(locationMapper.expandPathToCurrentRequestBaseUrl("/intervention/{id}/{resource}/{number}", id, "session", 4).toString())
      .isEqualTo("http://localhost/intervention/a98d6ea3-357d-4910-9a43-fd383bf996c5/session/4")
  }
}
