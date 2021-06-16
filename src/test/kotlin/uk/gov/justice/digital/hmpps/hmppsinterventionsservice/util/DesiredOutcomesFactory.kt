package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import java.util.UUID

class DesiredOutcomesFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val serviceCategoryFactory = ServiceCategoryFactory(em)
  fun create(
    serviceCategory: ServiceCategory = serviceCategoryFactory.create(),
    number: Int
  ): List<DesiredOutcome> {
    return (1..number).map {
      save(DesiredOutcome(id = UUID.randomUUID(), "", serviceCategoryId = serviceCategory.id))
    }
  }
}
