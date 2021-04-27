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
  val actionPlanRepository: ActionPlanRepository,
  val actionPlanAppointmentRepository: ActionPlanAppointmentRepository,
  val authUserRepository: AuthUserRepository,
  val endOfServiceReportRepository: EndOfServiceReportRepository,
) {

  private val interventionFactory = InterventionFactory(entityManager)
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory(entityManager)
  private val npsRegionFactory = NPSRegionFactory(entityManager)
  private val pccRegionFactory = PCCRegionFactory(entityManager)

  @BeforeEach
  fun setup() {
    actionPlanAppointmentRepository.deleteAll()
    actionPlanRepository.deleteAll()
    referralRepository.deleteAll()
    interventionRepository.deleteAll()
    endOfServiceReportRepository.deleteAll()
    authUserRepository.deleteAll()
  }

  @Test
  fun `get interventions with no filters`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()), title = "test Title")
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create()))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf(), null, null, null, null)
    assertThat(found.size).isEqualTo(3)
  }

  @Test
  fun `get interventions filtering by location where only nps region interventions are available`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create(id = 'H', name = "name")))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("devon-and-cornwall"), null, null, null, null)

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
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("avon-and-somerset"), null, null, null, null)

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
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("avon-and-somerset"), null, null, null, null)

    assertThat(found.size).isEqualTo(2)
    found.forEach {
      assert(it.dynamicFrameworkContract.pccRegion?.id.equals("avon-and-somerset") || it.dynamicFrameworkContract.npsRegion?.id?.equals('G')!!)
    }
  }

  @Test
  fun `get interventions filtering by allowsFemale is true`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsFemale = false))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf(), true, null, null, null)

    assertThat(found.size).isEqualTo(1)
    assertThat(found[0].dynamicFrameworkContract.allowsFemale).isTrue
  }

  @Test
  fun `get interventions filtering by allowsFemale is false`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsFemale = false))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf(), false, null, null, null)

    assertThat(found.size).isEqualTo(1)
    assertThat(found[0].dynamicFrameworkContract.allowsFemale).isFalse
  }

  @Test
  fun `get interventions filtering by allowsMale is true`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsMale = false))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf(), null, true, null, null)

    assertThat(found.size).isEqualTo(1)
    assertThat(found[0].dynamicFrameworkContract.allowsMale).isTrue
  }

  @Test
  fun `get interventions filtering by allowsMale is false`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsMale = false))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf(), null, false, null, null)

    assertThat(found.size).isEqualTo(1)
    assertThat(found[0].dynamicFrameworkContract.allowsMale).isFalse
  }

  @Test
  fun `get interventions filtering by both allowsMale is true and allowsFemale is true`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsFemale = false))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsMale = false))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf(), allowsFemale = true, allowsMale = true, null, null)

    assertThat(found.size).isEqualTo(1)
    assertThat(found[0].dynamicFrameworkContract.allowsFemale).isTrue
    assertThat(found[0].dynamicFrameworkContract.allowsMale).isTrue
  }

  @Test
  fun `get interventions filtering by both allowsMale is false and allowsFemale is true`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsFemale = false))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsMale = false))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf(), allowsFemale = true, allowsMale = false, null, null)

    assertThat(found.size).isEqualTo(1)
    assertThat(found[0].dynamicFrameworkContract.allowsFemale).isTrue
    assertThat(found[0].dynamicFrameworkContract.allowsMale).isFalse
  }

  @Test
  fun `get interventions filtering by location, allowsMale and allowsFemale`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(npsRegion = npsRegionFactory.create()))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(pccRegion = pccRegionFactory.create(id = "testID", name = "testName")))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(allowsMale = false, pccRegion = pccRegionFactory.create()))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("avon-and-somerset"), allowsFemale = true, allowsMale = false, null, null)

    assertThat(found.size).isEqualTo(1)
    assertThat(found[0].dynamicFrameworkContract.allowsFemale).isTrue
    assertThat(found[0].dynamicFrameworkContract.allowsMale).isFalse
    assertThat(found[0].dynamicFrameworkContract.pccRegion?.id).isEqualTo("avon-and-somerset")
  }

  @Test
  fun `get interventions filtering by minimum age on exact match`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(minimumAge = 28))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(minimumAge = 29))
    val found = interventionFilterRepositoryImpl.findByCriteria(emptyList(), null, null, 28, null)

    assertThat(found.size).isEqualTo(1)
    found.forEach {
      assertThat(it.dynamicFrameworkContract.minimumAge).isEqualTo(28)
    }
  }

  @Test
  fun `get interventions filtering by maximum age on exact match`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(maximumAge = 28))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(maximumAge = 29))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(maximumAge = null))
    val found = interventionFilterRepositoryImpl.findByCriteria(emptyList(), null, null, null, 29)

    assertThat(found.size).isEqualTo(1)
    found.forEach {
      assertThat(it.dynamicFrameworkContract.maximumAge).isEqualTo(29)
    }
  }

  @Test
  fun `get interventions filtering by minimum and maximum age on exact match and region`() {
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(minimumAge = 18, maximumAge = 29, pccRegion = pccRegionFactory.create(id = "region1", name = "name 1")))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(minimumAge = 18, maximumAge = 29, pccRegion = pccRegionFactory.create(id = "region2", name = "name 2")))
    interventionFactory.create(contract = dynamicFrameworkContractFactory.create(minimumAge = 18, maximumAge = 30, pccRegion = pccRegionFactory.create(id = "region3", name = "name 3")))
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("region1", "region2"), null, null, null, 29)

    assertThat(found.size).isEqualTo(2)
    found.forEach {
      assertThat(it.dynamicFrameworkContract.minimumAge).isEqualTo(18)
      assertThat(it.dynamicFrameworkContract.maximumAge).isEqualTo(29)
    }
  }
}
