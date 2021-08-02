package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance.PerformanceReportProcessor
import java.lang.RuntimeException
import java.util.UUID

internal class PerformanceReportDataProcessorTest {
  private val referralRepository = mock<ReferralRepository>()
  private val processor = PerformanceReportProcessor(referralRepository)

  @Test
  fun `will not process draft referrals`() {
    whenever(referralRepository.findByIdAndSentAtIsNotNull(any())).thenReturn(null)

    assertThrows<RuntimeException> { processor.process(UUID.randomUUID()) }
  }
}
