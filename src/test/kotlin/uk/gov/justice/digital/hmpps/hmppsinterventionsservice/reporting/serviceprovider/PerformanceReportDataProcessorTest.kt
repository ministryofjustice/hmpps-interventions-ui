package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.kotlin.mock
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance.PerformanceReportProcessor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ActionPlanService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.lang.RuntimeException

internal class PerformanceReportDataProcessorTest {
  private val actionPlanService = mock<ActionPlanService>()
  private val processor = PerformanceReportProcessor(actionPlanService)

  private val referralFactory = ReferralFactory()

  @Test
  fun `will not process draft referrals`() {
    val referral = referralFactory.createDraft()

    assertThrows<RuntimeException> { processor.process(referral) }
  }
}
