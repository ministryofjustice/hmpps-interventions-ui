package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason

class CancellationReasonFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  fun create(
    id: String = "MIS",
    description: String = "Referral was made by mistake",
  ): CancellationReason {
    return save(
      CancellationReason(
        id = id,
        description = description,
      )
    )
  }
}
