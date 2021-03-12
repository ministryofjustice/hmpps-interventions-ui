package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.EndOfServiceReportRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.util.Optional.empty
import java.util.Optional.of
import java.util.UUID
import javax.persistence.EntityNotFoundException

class EndOfServiceReportServiceTest {

  private val authUserRepository: AuthUserRepository = mock()
  private val referralRepository: ReferralRepository = mock()
  private val endOfServiceReportRepository: EndOfServiceReportRepository = mock()

  private val endOfServiceReportService = EndOfServiceReportService(authUserRepository, referralRepository, endOfServiceReportRepository)

  @Test
  fun `create end of service report`() {
    val authUser = AuthUser("CRN123", "auth", "user")
    val endOfServiceReport = SampleData.sampleEndOfServiceReport(outcomes = mutableListOf())
    val referral = SampleData.sampleReferral(endOfServiceReport = endOfServiceReport, crn = "CRN123", serviceProviderName = "Service Provider")

    whenever(authUserRepository.save(authUser)).thenReturn(authUser)
    whenever(referralRepository.findById(referral.id)).thenReturn(of(referral))
    whenever(endOfServiceReportRepository.save(any())).thenReturn(endOfServiceReport)
    whenever(referralRepository.save(any())).thenReturn(referral)

    val savedEndOfServiceReport = endOfServiceReportService.createEndOfServiceReport(referral.id, authUser)

    assertThat(savedEndOfServiceReport).isNotNull
  }

  @Test
  fun `referral not found when creating end of service report`() {
    val authUser = AuthUser("CRN123", "auth", "user")
    val referralId = UUID.randomUUID()
    whenever(referralRepository.findById(referralId)).thenReturn(empty())

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      endOfServiceReportService.createEndOfServiceReport(referralId, authUser)
    }
    assertThat(exception.message).isEqualTo("referral not found [id=$referralId]")
  }

  @Test
  fun `get end of service report`() {
    val endOfServiceReport = SampleData.sampleEndOfServiceReport(outcomes = mutableListOf())
    whenever(endOfServiceReportRepository.findById(any())).thenReturn(of(endOfServiceReport))
    val retrievedEndOfServiceReport = endOfServiceReportService.getEndOfServiceReport(UUID.randomUUID())
    assertThat(retrievedEndOfServiceReport).isNotNull
  }

  @Test
  fun `get end of service report not found`() {
    val endOfServiceReportId = UUID.randomUUID()
    whenever(endOfServiceReportRepository.findById(any())).thenReturn(empty())

    val exception = Assertions.assertThrows(EntityNotFoundException::class.java) {
      endOfServiceReportService.getEndOfServiceReport(endOfServiceReportId)
    }
    assertThat(exception.message).isEqualTo("End of service report not found [id=$endOfServiceReportId]")
  }
}
