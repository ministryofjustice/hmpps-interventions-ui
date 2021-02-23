package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.persistIntervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleIntervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.NPSRegionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.PCCRegionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceCategoryFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceProviderFactory
import java.time.LocalDate

@RepositoryTest
class InterventionServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val pccRegionRepository: PCCRegionRepository,
  val interventionRepository: InterventionRepository,
  val referralRepository: ReferralRepository,
) {
  private val interventionService = InterventionService(pccRegionRepository, interventionRepository)
  private val serviceCategoryFactory = ServiceCategoryFactory(entityManager)
  private val npsRegionFactory = NPSRegionFactory(entityManager)
  private val pccRegionFactory = PCCRegionFactory(entityManager)
  private val serviceProviderFactory = ServiceProviderFactory(entityManager)

  @BeforeEach
  fun setup() {
    referralRepository.deleteAll()
    interventionRepository.deleteAll()
  }

  @Test
  fun `get an Intervention with NPS Region`() {
    val npsRegion = npsRegionFactory.create(id = 'X', name = "fake nps region")
    listOf("fake-pcc-region-1", "fake-pcc-region-2").forEach {
      pccRegionFactory.create(it, it, npsRegion)
    }

    val intervention = persistIntervention(
      entityManager,
      sampleIntervention(
        dynamicFrameworkContract = sampleContract(
          npsRegion = npsRegion,
          serviceCategory = serviceCategoryFactory.create(),
          serviceProvider = serviceProviderFactory.create(),
        )
      )
    )

    val interventionDTO = interventionService.getIntervention(intervention.id)
    assertThat(interventionDTO!!.title).isEqualTo(intervention.title)
    assertThat(interventionDTO.description).isEqualTo(intervention.description)
    // fixme
    // when only the nps region is set, the pcc regions are auto populated 
//    assertThat(interventionDTO.pccRegions.size).isEqualTo(2)
  }

  @Test
  fun `get an Intervention with PCC Region`() {
    val intervention = persistIntervention(
      entityManager,
      sampleIntervention(
        dynamicFrameworkContract = sampleContract(
          pccRegion = pccRegionFactory.create(),
          serviceCategory = serviceCategoryFactory.create(),
          serviceProvider = serviceProviderFactory.create(),
        )
      )
    )

    val interventionDTO = interventionService.getIntervention(intervention.id)
    assertThat(interventionDTO!!.title).isEqualTo(intervention.title)
    assertThat(interventionDTO.description).isEqualTo(intervention.description)
    // fixme
//    assertThat(interventionDTO.pccRegions.size).isEqualTo(1)
  }

  @Test
  fun `get correct interventions for multiple service providers`() {
    saveMultipleInterventions()

    val harmonyLivingInterventions = interventionService.getInterventionsForServiceProvider("HARMONY_LIVING")
    assertThat(harmonyLivingInterventions.size).isEqualTo(2)
    val homeTrustInterventions = interventionService.getInterventionsForServiceProvider("HOME_TRUST")
    assertThat(homeTrustInterventions.size).isEqualTo(1)
    val liveWellInterventions = interventionService.getInterventionsForServiceProvider("LIVE_WELL")
    assertThat(liveWellInterventions.size).isEqualTo(0)
    val notExistInterventions = interventionService.getInterventionsForServiceProvider("DOES_NOT_EXIST")
    assertThat(notExistInterventions.size).isEqualTo(0)
  }

  // fixme: this test assumes the results are returned in a certain order.
  // it needs re-writing but i'm going to do it in another PR.
//  @Test
//  fun `get all interventions`() {
//    saveMultipleInterventions()
//    val interventions = interventionService.getAllInterventions()
//    assertThat(interventions.size).isEqualTo(3)
//
//    assertThat(interventions[0].serviceCategory.name).isEqualTo("accommodation")
//    assertThat(interventions[0].pccRegions.size).isEqualTo(2)
//    assertThat(interventions[0].serviceProvider.name).isEqualTo("Harmony Living")
//    assertThat(interventions[1].pccRegions.size).isEqualTo(2)
//    assertThat(interventions[1].serviceProvider.name).isEqualTo("Harmony Living")
//    assertThat(interventions[2].pccRegions.size).isEqualTo(1)
//    assertThat(interventions[2].serviceProvider.name).isEqualTo("Home Trust")
//  }

  @Test
  fun `get all interventions when none exist`() {
    val interventions = interventionService.getAllInterventions()
    assertThat(interventions.size).isEqualTo(0)
  }

  private fun saveMultipleInterventions() {
    val accommodationSC = serviceCategoryFactory.create(name = "accommodation")

    // build map of service providers
    val serviceProviders = mapOf(
      "harmonyLiving" to serviceProviderFactory.create("HARMONY_LIVING", "Harmony Living", "contact@harmonyliving.com"),
      "homeTrust" to serviceProviderFactory.create("HOME_TRUST", "Home Trust", "manager@hometrust.com"),
      "liveWell" to serviceProviderFactory.create("LIVE_WELL", "Live Well", "contact@livewell.com")
    )

    val npsRegion = npsRegionFactory.create()
    val pccRegionAvon = pccRegionFactory.create("avon-and-somerset", "Avon & Somerset")

    // build map of contracts
    val contracts = mapOf(
      "harmonyLiving1" to sampleContract(
        serviceCategory = accommodationSC,
        serviceProvider = serviceProviders["harmonyLiving"]!!,
        npsRegion = npsRegion,
      ),
      "harmonyLiving2" to sampleContract(
        serviceCategory = accommodationSC,
        serviceProvider = serviceProviders["harmonyLiving"]!!,
        startDate = LocalDate.of(2020, 11, 5),
        endDate = LocalDate.of(2022, 10, 7),
        npsRegion = npsRegion,
      ),
      "homeTrust" to sampleContract(
        serviceCategory = accommodationSC,
        serviceProvider = serviceProviders["homeTrust"]!!,
        startDate = LocalDate.of(2019, 5, 12),
        endDate = LocalDate.of(2022, 5, 12),
        pccRegion = pccRegionAvon,
      )
    )
    contracts.values.forEach { entityManager.persist(it) }
    entityManager.flush()

    // Create and save interventions
    val interventions = mapOf(
      "intervention1" to sampleIntervention(dynamicFrameworkContract = contracts["harmonyLiving1"]!!),
      "intervention2" to sampleIntervention(dynamicFrameworkContract = contracts["harmonyLiving2"]!!),
      "intervention3" to sampleIntervention(dynamicFrameworkContract = contracts["homeTrust"]!!)
    )
    interventions.values.forEach {
      entityManager.persistAndFlush(it)
    }
  }
}
