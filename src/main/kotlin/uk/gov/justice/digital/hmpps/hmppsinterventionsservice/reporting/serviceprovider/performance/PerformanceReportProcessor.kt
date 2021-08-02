package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.serviceprovider.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments.kv
import org.springframework.batch.item.ItemProcessor
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.util.UUID

@Component
class PerformanceReportProcessor(
  private val referralRepository: ReferralRepository,
) : ItemProcessor<UUID, PerformanceReportData> {
  companion object : KLogging()

  override fun process(referralId: UUID): PerformanceReportData {
    logger.info("processing referral {}", kv("referralId", referralId))

    val referral = referralRepository.findByIdAndSentAtIsNotNull(referralId)
      ?: throw RuntimeException("invalid referral id passed to report processor")

    // note: all referrals here are 'sent', we can safely access fields like 'referenceNumber'
    return PerformanceReportData(
      id = referral.id,
      referralReference = referral.referenceNumber!!,
      serviceUserCRN = referral.serviceUserCRN,
      dateReferralReceived = referral.sentAt!!,
      contractReference = referral.intervention.dynamicFrameworkContract.contractReference,
      organisationId = referral.intervention.dynamicFrameworkContract.primeProvider.id,
    )
  }
}
