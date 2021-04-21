package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import java.util.UUID

class DesiredOutcomeFactory(em: TestEntityManager? = null) : EntityFactory(em) {

  fun create(
    id: UUID = UUID.randomUUID(),
    description: String = "Outcome 1",
    serviceCategoryId: UUID = UUID.randomUUID()
  ): DesiredOutcome {
    return save(
      DesiredOutcome(
        id, description, serviceCategoryId
      )
    )
  }
}
