package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DynamicFrameworkContractFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.InterventionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.NPSRegionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.PCCRegionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class InterventionFilterRepositoryImplTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val interventionFilterRepositoryImpl: InterventionFilterRepository,
  val interventionRepository: InterventionRepository,
  val referralRepository: ReferralRepository,
) {

  private val interventionFactory = InterventionFactory(entityManager)
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory(entityManager)
  private val npsRegionFactory = NPSRegionFactory(entityManager)
  private val pccRegionFactory = PCCRegionFactory(entityManager)

  @BeforeEach
  fun setup() {
    referralRepository.deleteAll()
    interventionRepository.deleteAll()
  }

  @Test
  fun `get interventions with no filters`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()), title = "test Title")
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create()))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf())
    assertThat(found.size).isEqualTo(3)
  }

  @Test
  fun `get interventions filtering by location where only nps region interventions are available`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create(id = 'H', name = "name")))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("devon-and-cornwall"))

    assertThat(found.size).isEqualTo(2)
    found.forEach {
      assertThat(it.dynamicFrameworkContract.npsRegion?.id).isEqualTo('G')
    }
  }

  @Test
  fun `get interventions filtering by location where only pcc region interventions are available`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create(id = "testID", name = "testName")))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("avon-and-somerset"))

    assertThat(found.size).isEqualTo(2)
    found.forEach {
      assert(it.dynamicFrameworkContract.pccRegion?.id.equals("avon-and-somerset"))
    }
  }

  @Test
  fun `get interventions filtering by location both pcc regions and nps regions interventions are available`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create(id = "testID", name = "testName")))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("avon-and-somerset"))

    assertThat(found.size).isEqualTo(2)
    found.forEach {
      assert(it.dynamicFrameworkContract.pccRegion?.id.equals("avon-and-somerset") || it.dynamicFrameworkContract.npsRegion?.id?.equals('G')!!)
    }
  }
}
