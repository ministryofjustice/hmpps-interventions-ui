package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.NPSRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion

class PCCRegionFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val npsRegionFactory = NPSRegionFactory(em)

  fun create(
    id: String = "avon-and-somerset",
    name: String = "Avon & Somerset",
    npsRegion: NPSRegion? = null
  ):
    PCCRegion {
    return save(PCCRegion(id = id, name = name, npsRegion = npsRegion ?: npsRegionFactory.create()))
  }
}
