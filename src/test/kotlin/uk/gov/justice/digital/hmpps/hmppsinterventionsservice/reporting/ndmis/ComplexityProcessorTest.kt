package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ComplexityLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance.ComplexityProcessor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceCategoryFactory
import java.util.UUID

internal class ComplexityProcessorTest {
  private val processor = ComplexityProcessor()

  private val referralFactory = ReferralFactory()
  private val serviceCategoryFactory = ServiceCategoryFactory()

  @Test
  fun `will not process draft referrals`() {
    val referral = referralFactory.createDraft()

    assertThrows<RuntimeException> { processor.process(referral) }
  }

  @Test
  fun `referral with single selected service category correctly returns a complexityData object`() {
    val complexityLevel = ComplexityLevel(UUID.randomUUID(), "high", "description1")
    val serviceCategory1 = serviceCategoryFactory.create(complexityLevels = listOf(complexityLevel))
    val referral = referralFactory.createSent(selectedServiceCategories = mutableSetOf(serviceCategory1))
    referral.complexityLevelIds = mutableMapOf(serviceCategory1.id to complexityLevel.id)

    val result = processor.process(referral)

    assertThat(result.size).isEqualTo(1)
    assertThat(result[0].referralReference).isEqualTo("JS18726AC")
    assertThat(result[0].referralId).isEqualTo(referral.id)
    assertThat(result[0].interventionTitle).isEqualTo("Sheffield Housing Services")
    assertThat(result[0].serviceCategoryId).isEqualTo(serviceCategory1.id)
    assertThat(result[0].serviceCategoryName).isEqualTo("accommodation")
    assertThat(result[0].complexityLevelTitle).isEqualTo("high")
  }

  @Test
  fun `referral with multiple selected service category correctly returns a complexityData object`() {
    val complexityLevel1 = ComplexityLevel(UUID.randomUUID(), "high", "description1")
    val complexityLevel2 = ComplexityLevel(UUID.randomUUID(), "medium", "description1")
    val serviceCategory1 = serviceCategoryFactory.create(complexityLevels = listOf(complexityLevel1))
    val serviceCategory2 = serviceCategoryFactory.create(name = "Lifestyle and Associates", complexityLevels = listOf(complexityLevel2))
    val referral = referralFactory.createSent(selectedServiceCategories = mutableSetOf(serviceCategory1, serviceCategory2))
    referral.complexityLevelIds = mutableMapOf(serviceCategory1.id to complexityLevel1.id, serviceCategory2.id to complexityLevel2.id)

    val result = processor.process(referral)

    assertThat(result.size).isEqualTo(2)
    assertThat(result[0].referralReference).isEqualTo("JS18726AC")
    assertThat(result[0].referralId).isEqualTo(referral.id)
    assertThat(result[0].interventionTitle).isEqualTo("Sheffield Housing Services")
    assertThat(result[0].serviceCategoryId).isEqualTo(serviceCategory1.id)
    assertThat(result[0].serviceCategoryName).isEqualTo("accommodation")
    assertThat(result[0].complexityLevelTitle).isEqualTo("high")

    assertThat(result[1].referralReference).isEqualTo("JS18726AC")
    assertThat(result[1].referralId).isEqualTo(referral.id)
    assertThat(result[1].interventionTitle).isEqualTo("Sheffield Housing Services")
    assertThat(result[1].serviceCategoryId).isEqualTo(serviceCategory2.id)
    assertThat(result[1].serviceCategoryName).isEqualTo("Lifestyle and Associates")
    assertThat(result[1].complexityLevelTitle).isEqualTo("medium")
  }
}
