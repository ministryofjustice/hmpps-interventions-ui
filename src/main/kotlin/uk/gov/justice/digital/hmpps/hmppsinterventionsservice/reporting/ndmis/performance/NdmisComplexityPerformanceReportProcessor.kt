package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance

import mu.KLogging
import net.logstash.logback.argument.StructuredArguments
import org.springframework.batch.item.ItemProcessor
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

@Component
class NdmisComplexityPerformanceReportProcessor(
) : ItemProcessor<Referral, List<ComplexityData>> {
  companion object : KLogging()

  override fun process(referral: Referral): List<ComplexityData> {
    logger.debug("processing referral {}", StructuredArguments.kv("referralId", referral.id))

    if (referral.sentAt == null) throw RuntimeException("invalid referral passed to report processor; referral has not been sent")

    return referral.selectedServiceCategories!!.map {
      ComplexityData(
        referralReference = referral.referenceNumber!!,
        referralId = referral.id,
        interventionTitle = referral.intervention.title,
        serviceCategoryId = it.id,
        serviceCategoryName = it.name,
        complexityLevelTitle = it.complexityLevels.find {
            complexityLevel -> complexityLevel.id == referral.complexityLevelIds!![it.id]
        }!!.title
      )
    }
  }
}
