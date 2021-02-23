package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ComplexityLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import java.time.OffsetDateTime
import java.util.UUID

class ServiceCategoryFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  fun create(
    id: UUID? = null,
    name: String = "accommodation",
    complexityLevels: List<ComplexityLevel> = emptyList(),
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    created: OffsetDateTime? = null
  ): ServiceCategory {

    // this is really annoying - when we save the service category, JPgit stA runs
    // statements like "update desired_outcome set service_category_id=? where id=?".
    // this fails if the desired outcome doesn't exist. BUT we can't create the
    // desired outcome first because it has a foreign key constraint on the
    // "service_category_id" column. so we have to create the service category
    // without the nested entities, then create the nested entities, then re-create
    // the service category with them included. YUCK!
    save(
      ServiceCategory(
        id = id ?: UUID.randomUUID(),
        name = name,
        created = created ?: OffsetDateTime.now(),
        desiredOutcomes = mutableListOf(),
        complexityLevels = mutableListOf(),
      )
    )

    complexityLevels.forEach { save(it) }
    desiredOutcomes.forEach { save(it) }

    return save(
      ServiceCategory(
        id = id ?: UUID.randomUUID(),
        name = name,
        created = created ?: OffsetDateTime.now(),
        desiredOutcomes = desiredOutcomes,
        complexityLevels = complexityLevels,
      )
    )
  }
}
