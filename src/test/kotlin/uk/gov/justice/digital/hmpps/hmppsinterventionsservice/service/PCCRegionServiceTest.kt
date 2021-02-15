package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.PCCRegionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class PCCRegionServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  pccRegionRepository: PCCRegionRepository,
) {
  val pccRegionService = PCCRegionService(pccRegionRepository)
  val pccRegionFactory = PCCRegionFactory(entityManager)

  @Test
  fun `get all PCC Regions`() {
    pccRegionFactory.create("avon-and-somerset", "Avon & Somerset")
    pccRegionFactory.create("devon-and-cornwall", "Devon & Cornwall")
    pccRegionFactory.create("dorset", "Dorset")

    assertThat(pccRegionService.getAllPCCRegions().size).isGreaterThanOrEqualTo(3)
  }
}
