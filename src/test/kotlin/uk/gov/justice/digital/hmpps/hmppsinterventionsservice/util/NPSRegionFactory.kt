package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.NPSRegion

class NPSRegionFactory(em: TestEntityManager) : EntityFactory(em) {
  fun create(id: Char = 'G', name: String = "South West"): NPSRegion {
    return save(NPSRegion(id = id, name = name))
  }
}
