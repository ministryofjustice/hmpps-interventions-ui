package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import java.time.OffsetDateTime
import java.util.UUID

class InterventionFactory(em: TestEntityManager) : EntityFactory(em) {
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory(em)

  fun create(
    id: UUID? = UUID.randomUUID(),
    createdAt: OffsetDateTime? = null,
    title: String = "Sheffield Housing Services",
    description: String = "Inclusive housing for South Yorkshire",
    contract: DynamicFrameworkContract? = null,
  ): Intervention {
    return save(
      Intervention(
        id = id ?: UUID.randomUUID(),
        createdAt = createdAt ?: OffsetDateTime.now(),
        title = title,
        description = description,
        dynamicFrameworkContract = contract ?: dynamicFrameworkContractFactory.create(),
      )
    )
  }
}
