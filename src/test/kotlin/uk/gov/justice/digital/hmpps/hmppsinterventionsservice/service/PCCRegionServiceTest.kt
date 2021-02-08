package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository

@DataJpaTest
@ActiveProfiles("jpa-test")
class PCCRegionServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  pccRegionRepository: PCCRegionRepository,
) {
  val pccRegionService = PCCRegionService(pccRegionRepository)

  @Test
  fun `get all PCC Regions`() {
    entityManager.persistAndFlush(SampleData.sampleNPSRegion())
    val pccRegions = listOf(
      SampleData.samplePCCRegion(),
      SampleData.samplePCCRegion(id = "devon-and-cornwall", name = "Devon & Cornwall"),
      SampleData.samplePCCRegion(id = "dorset", name = "Dorset")
    )
    pccRegions.forEach { entityManager.persist(it) }
    entityManager.flush()

    assertThat(pccRegionService.getAllPCCRegions().size).isEqualTo(3)
  }
}
