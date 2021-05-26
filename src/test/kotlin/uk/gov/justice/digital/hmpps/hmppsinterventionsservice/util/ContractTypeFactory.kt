package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ContractType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import java.util.UUID

class ContractTypeFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val serviceCategoryFactory = ServiceCategoryFactory(em)

  fun create(
    id: UUID = UUID.randomUUID(),
    name: String = "Accommodation",
    code: String = "ACC",
    serviceCategories: Set<ServiceCategory> = setOf(serviceCategoryFactory.create(name = "accommodation"))
  ): ContractType {
    return save(
      ContractType(
        id = id,
        name = name,
        code = code,
        serviceCategories = serviceCategories,
      )
    )
  }
}
