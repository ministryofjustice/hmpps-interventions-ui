package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.LocationMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller.mappers.EndOfServiceReportOutcomeMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateEndOfServiceReportDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateEndOfServiceReportOutcomeDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EndOfServiceReportDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateEndOfServiceReportDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AchievementLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.EndOfServiceReportService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.net.URI
import java.util.UUID

class EndOfServiceReportControllerTest {
  private val userMapper = mock<UserMapper>()
  private val endOfServiceReportService = mock<EndOfServiceReportService>()
  private val locationMapper = mock<LocationMapper>()
  private val endOfServiceReportOutcomeMapper = mock<EndOfServiceReportOutcomeMapper>()
  private val referralFactory = ReferralFactory()

  private val endOfServiceReportController =
    EndOfServiceReportController(userMapper, locationMapper, endOfServiceReportService, endOfServiceReportOutcomeMapper)

  @Test
  fun `create end of service report successfully`() {
    val referral = referralFactory.createSent()
    val jwtAuthenticationToken = JwtAuthenticationToken(mock())
    val authUser = AuthUser("CRN123", "auth", "user")
    val endOfServiceReport = SampleData.sampleEndOfServiceReport(referral = referral)
    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)
    val uri = URI.create("http://localhost/1234")
    val createEndOfServiceReportDTO = CreateEndOfServiceReportDTO(referral.id)

    whenever(userMapper.fromToken(jwtAuthenticationToken)).thenReturn(authUser)
    whenever(endOfServiceReportService.createEndOfServiceReport(referral.id, authUser)).thenReturn(endOfServiceReport)
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl("/{id}", endOfServiceReportDTO.id)).thenReturn(uri)

    val endOfServiceReportResponse = endOfServiceReportController.createEndOfServiceReport(createEndOfServiceReportDTO, jwtAuthenticationToken)
    assertThat(endOfServiceReportResponse.let { it.body }).isEqualTo(endOfServiceReportDTO)
    assertThat(endOfServiceReportResponse.let { it.headers["location"] }).isEqualTo(listOf(uri.toString()))
  }

  @Test
  fun `get end of service report successfully`() {
    val referral = referralFactory.createSent()
    val endOfServiceReportId = UUID.randomUUID()
    val endOfServiceReport = SampleData.sampleEndOfServiceReport(referral = referral)
    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)

    whenever(endOfServiceReportService.getEndOfServiceReport(endOfServiceReportId)).thenReturn(endOfServiceReport)

    val endOfServiceReportResponse = endOfServiceReportController.getEndOfServiceReportById(endOfServiceReportId)
    assertThat(endOfServiceReportResponse).isEqualTo(endOfServiceReportDTO)
  }

  @Test
  fun `get end of service report by referral id successfully`() {
    val referral = referralFactory.createSent()
    val endOfServiceReport = SampleData.sampleEndOfServiceReport(referral = referral)
    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)

    whenever(endOfServiceReportService.getEndOfServiceReportByReferralId(referral.id)).thenReturn(endOfServiceReport)

    val endOfServiceReportResponse = endOfServiceReportController.getEndOfServiceReportByReferralId(referral.id)
    assertThat(endOfServiceReportResponse).isEqualTo(endOfServiceReportDTO)
  }

  @Test
  fun `update an end of service report`() {
    val referral = referralFactory.createSent()
    val endOfServiceReportId = UUID.randomUUID()
    val outcome = CreateEndOfServiceReportOutcomeDTO(UUID.randomUUID(), AchievementLevel.ACHIEVED, null, null)
    val mappedOutcome = SampleData.sampleEndOfServiceReportOutcome()
    val updateEndOfServiceReportDTO = UpdateEndOfServiceReportDTO("info", outcome)

    val endOfServiceReport = SampleData.sampleEndOfServiceReport(referral = referral)
    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)

    whenever(endOfServiceReportOutcomeMapper.mapCreateEndOfServiceReportOutcomeDtoToEndOfServiceReportOutcome(outcome))
      .thenReturn(mappedOutcome)
    whenever(endOfServiceReportService.updateEndOfServiceReport(endOfServiceReportId, "info", mappedOutcome))
      .thenReturn(endOfServiceReport)

    val endOfServiceReportResponse = endOfServiceReportController.updateEndOfServiceReport(endOfServiceReportId, updateEndOfServiceReportDTO)
    assertThat(endOfServiceReportResponse).isEqualTo(endOfServiceReportDTO)
  }

  @Test
  fun `update end of service report with no extra outcome`() {
    val referral = referralFactory.createSent()
    val endOfServiceReportId = UUID.randomUUID()
    val outcome = CreateEndOfServiceReportOutcomeDTO(UUID.randomUUID(), AchievementLevel.ACHIEVED, null, null)
    val updateEndOfServiceReportDTO = UpdateEndOfServiceReportDTO("info", outcome)

    val endOfServiceReport = SampleData.sampleEndOfServiceReport(referral = referral)
    val endOfServiceReportDTO = EndOfServiceReportDTO.from(endOfServiceReport)

    whenever(endOfServiceReportService.updateEndOfServiceReport(endOfServiceReportId, "info", null))
      .thenReturn(endOfServiceReport)
    verifyZeroInteractions(endOfServiceReportOutcomeMapper)
    val endOfServiceReportResponse = endOfServiceReportController.updateEndOfServiceReport(endOfServiceReportId, updateEndOfServiceReportDTO)
    assertThat(endOfServiceReportResponse).isEqualTo(endOfServiceReportDTO)
  }

  @Test
  fun `submit end of service report`() {
    val referral = referralFactory.createSent()
    val endOfServiceReportId = UUID.randomUUID()
    val jwtAuthenticationToken = JwtAuthenticationToken(mock())
    val authUser = AuthUser("CRN123", "auth", "user")
    val endOfServiceReport = SampleData.sampleEndOfServiceReport(id = endOfServiceReportId, referral = referral)
    val uri = URI.create("http://localhost/end-of-service-report/1234")

    whenever(userMapper.fromToken(jwtAuthenticationToken)).thenReturn(authUser)
    whenever(locationMapper.expandPathToCurrentRequestBaseUrl("/end-of-service-report/{id}", endOfServiceReportId)).thenReturn(uri)
    whenever(endOfServiceReportService.submitEndOfServiceReport(endOfServiceReportId, authUser)).thenReturn(endOfServiceReport)

    val response = endOfServiceReportController.submitEndOfServiceReport(endOfServiceReportId, jwtAuthenticationToken)
    assertThat(response).isEqualTo(EndOfServiceReportDTO.from(endOfServiceReport))
  }
}
