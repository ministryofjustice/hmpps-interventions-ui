package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

class InterventionFactory(em: TestEntityManager) : EntityFactory(em) {
  private val serviceCategoryFactory = ServiceCategoryFactory(em)
  private val serviceProviderFactory = ServiceProviderFactory(em)
  private val npsRegionFactory = NPSRegionFactory(em)
  private val pccRegionFactory = PCCRegionFactory(em)

  fun create(
    id: UUID? = null,
    createdAt: OffsetDateTime? = null,
    title: String = "Sheffield Housing Services",
    description: String = "Inclusive housing for South Yorkshire",
  ): Intervention {
    // for now we aren't allowing any of the contract details to be configured
    val contract = save(
      DynamicFrameworkContract(
        id = UUID.randomUUID(),
        serviceCategory = serviceCategoryFactory.create(),
        serviceProvider = serviceProviderFactory.create(),
        startDate = LocalDate.of(2021, 6, 1),
        endDate = LocalDate.of(2026, 6, 1),
        minimumAge = 18,
        maximumAge = null,
        allowsMale = true,
        allowsFemale = true,
        npsRegion = npsRegionFactory.create(),
        pccRegion = pccRegionFactory.create(),
      )
    )

    return save(
      Intervention(
        id = id ?: UUID.randomUUID(),
        createdAt = createdAt ?: OffsetDateTime.now(),
        title = title,
        description = description,
        dynamicFrameworkContract = contract,
      )
    )
  }
}
