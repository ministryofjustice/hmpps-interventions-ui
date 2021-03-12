package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.JwtAuthUserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndOfServiceReportDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.EndOfServiceReportService
import java.net.URI
import java.util.UUID

class EndOfServiceReportControllerTest {
  private val jwtAuthUserMapper = mock<JwtAuthUserMapper>()
  private val endOfServiceReportService = mock<EndOfServiceReportService>()
  private val locationMapper = mock<LocationMapper>()

  private val endOfServiceReportController = EndOfServiceReportController(jwtAuthUserMapper, locationMapper, endOfServiceReportService)

  @Test
  fun `create end of service report successfully`() {
    val referralId = UUID.randomUUID()
    val jwtAuthenticationToken = JwtAuthenticationToken(mock())
    val authUser = AuthUser("CRN123", "auth", "user")
    val endOfServiceReport = SampleData.sampleEndOfServiceReport()
    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)
    val uriComponents = UriComponentsBuilder.fromUri(URI.create("/1234")).build()

    whenever(jwtAuthUserMapper.map(jwtAuthenticationToken)).thenReturn(authUser)
    whenever(endOfServiceReportService.createEndOfServiceReport(referralId, authUser)).thenReturn(endOfServiceReport)
    whenever(locationMapper.mapToCurrentRequestBasePath("/{id}", endOfServiceReportDTO.id)).thenReturn(uriComponents)

    val endOfServiceReportResponse = endOfServiceReportController.createEndOfServiceReport(referralId, jwtAuthenticationToken)
    assertThat(endOfServiceReportResponse.let { it.body }).isEqualTo(endOfServiceReportDTO)
    assertThat(endOfServiceReportResponse.let { it.headers["location"] }).isEqualTo(listOf("/1234"))
  }

  @Test
  fun `get end of service report successfully`() {
    val endOfServiceReportId = UUID.randomUUID()
    val endOfServiceReport = SampleData.sampleEndOfServiceReport()
    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)

    whenever(endOfServiceReportService.getEndOfServiceReport(endOfServiceReportId)).thenReturn(endOfServiceReport)

    val endOfServiceReportResponse = endOfServiceReportController.getEndOfServiceReportById(endOfServiceReportId)
    assertThat(endOfServiceReportResponse).isEqualTo(endOfServiceReportDTO)
  }

  @Test
  fun `get end of service report by referral id successfully`() {
    val referralId = UUID.randomUUID()
    val endOfServiceReport = SampleData.sampleEndOfServiceReport()
    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)

    whenever(endOfServiceReportService.getEndOfServiceReportByReferralId(referralId)).thenReturn(endOfServiceReport)

    val endOfServiceReportResponse = endOfServiceReportController.getEndOfServiceReportByReferralId(referralId)
    assertThat(endOfServiceReportResponse).isEqualTo(endOfServiceReportDTO)
  }
}
