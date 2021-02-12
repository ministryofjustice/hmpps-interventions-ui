package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.persistIntervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleIntervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleNPSRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.samplePCCRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.PCCRegionRepository
import java.time.LocalDate

@DataJpaTest
@ActiveProfiles("jpa-test")
class InterventionServiceIntTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val pccRegionRepository: PCCRegionRepository,
  val interventionRepository: InterventionRepository,
) {
  private val interventionService = InterventionService(pccRegionRepository, interventionRepository)

  @Test
  fun `get an Intervention with NPS Region`() {
    val npsRegion = sampleNPSRegion()

    val intervention = persistIntervention(
      entityManager,
      sampleIntervention(
        dynamicFrameworkContract = sampleContract(
          npsRegion = npsRegion,
          serviceCategory = sampleServiceCategory(desiredOutcomes = emptyList()),
          serviceProvider = sampleServiceProvider(id = "HARMONY_LIVING", name = "Harmony Living")
        )
      )
    )

    entityManager.persistAndFlush(samplePCCRegion(npsRegion = npsRegion))
    entityManager.persistAndFlush(
      samplePCCRegion(
        id = "devon-and-cornwall",
        name = "Devon & Cornwall",
        npsRegion = npsRegion
      )
    )

    val interventionDTO = interventionService.getIntervention(intervention.id!!)
    assertThat(interventionDTO!!.title).isEqualTo(intervention.title)
    assertThat(interventionDTO.description).isEqualTo(intervention.description)
    assertThat(interventionDTO.pccRegions.size).isEqualTo(2)
  }

  @Test
  fun `get an Intervention with PCC Region`() {
    val intervention = persistIntervention(
      entityManager,
      sampleIntervention(
        dynamicFrameworkContract = sampleContract(
          pccRegion = samplePCCRegion(npsRegion = sampleNPSRegion()),
          serviceCategory = sampleServiceCategory(desiredOutcomes = emptyList()),
          serviceProvider = sampleServiceProvider(id = "HARMONY_LIVING", name = "Harmony Living")
        )
      )
    )

    val interventionDTO = interventionService.getIntervention(intervention.id!!)
    assertThat(interventionDTO!!.title).isEqualTo(intervention.title)
    assertThat(interventionDTO.description).isEqualTo(intervention.description)
    assertThat(interventionDTO.pccRegions.size).isEqualTo(1)
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

  @Test
  fun `get all interventions`() {
    saveMultipleInterventions()
    val interventions = interventionService.getAllInterventions()
    assertThat(interventions.size).isEqualTo(3)

    assertThat(interventions[0].serviceCategory.name).isEqualTo("Accommodation")
    assertThat(interventions[0].pccRegions.size).isEqualTo(2)
    assertThat(interventions[0].serviceProvider.name).isEqualTo("Harmony Living")
    assertThat(interventions[1].pccRegions.size).isEqualTo(2)
    assertThat(interventions[1].serviceProvider.name).isEqualTo("Harmony Living")
    assertThat(interventions[2].pccRegions.size).isEqualTo(1)
    assertThat(interventions[2].serviceProvider.name).isEqualTo("Home Trust")
  }

  @Test
  fun `get all interventions when none exist`() {
    val interventions = interventionService.getAllInterventions()
    assertThat(interventions.size).isEqualTo(0)
  }

  private fun saveMultipleInterventions() {
    val accommodationSC = sampleServiceCategory()
    entityManager.persist(accommodationSC)

    // build map of service providers
    val serviceProviders = mapOf(
      "harmonyLiving" to ServiceProvider("HARMONY_LIVING", "Harmony Living", "contact@harmonyliving.com"),
      "homeTrust" to ServiceProvider("HOME_TRUST", "Home Trust", "manager@hometrust.com"),
      "liveWell" to ServiceProvider("LIVE_WELL", "Live Well", "contact@livewell.com")
    )

    serviceProviders.values.forEach { entityManager.persist(it) }
    entityManager.flush()

    val npsRegion = sampleNPSRegion()
    entityManager.persistAndFlush(npsRegion)

    val pccRegionAvon = samplePCCRegion(npsRegion = npsRegion)
    val pccRegionDevon = samplePCCRegion(id = "devon-and-cornwall", name = "Devon & Cornwall", npsRegion = npsRegion)
    entityManager.persistAndFlush(pccRegionAvon)
    entityManager.persistAndFlush(pccRegionDevon)

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
