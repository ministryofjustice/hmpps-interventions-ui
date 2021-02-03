package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleIntervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleNPSRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData.Companion.sampleServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
import java.time.LocalDate

@DataJpaTest
@ActiveProfiles("jpa-test")
class InterventionServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val interventionRepository: InterventionRepository,
) {
  private val interventionService = InterventionService(interventionRepository)

  @Test
  fun `get an Intervention`() {
    val accommodationServiceCategory = sampleServiceCategory(desiredOutcomes = emptyList())
    val harmonyLivingServiceProvider = sampleServiceProvider()
    entityManager.persist(accommodationServiceCategory)
    entityManager.persist(harmonyLivingServiceProvider)
    entityManager.flush()

    val npsRegion = sampleNPSRegion()
    entityManager.persistAndFlush(npsRegion)

    val harmonyLivingContract = sampleContract(
      serviceCategory = accommodationServiceCategory,
      serviceProvider = harmonyLivingServiceProvider,
      npsRegion = npsRegion,
    )
    entityManager.persistAndFlush(harmonyLivingContract)

    val intervention: Intervention = sampleIntervention(dynamicFrameworkContract = harmonyLivingContract)
    entityManager.persistAndFlush(intervention)

    val savedIntervention = interventionService.getIntervention(intervention.id!!)
    assertThat(savedIntervention!!.id).isEqualTo(intervention.id)
    assertThat(savedIntervention.createdAt).isEqualTo(intervention.createdAt)
    assertThat(savedIntervention.title).isEqualTo(intervention.title)
    assertThat(savedIntervention.description).isEqualTo(intervention.description)
    assertThat(savedIntervention.dynamicFrameworkContract).isEqualTo(intervention.dynamicFrameworkContract)
  }

  @Test
  fun `get correct interventions for multiple service providers`() {
    val accommodationSC = sampleServiceCategory(desiredOutcomes = emptyList())
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
        npsRegion = npsRegion,
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
  fun `create and persist interventions against same contract`() {
    val accommodationServiceCategory = sampleServiceCategory(desiredOutcomes = emptyList())
    val harmonyLivingServiceProvider = sampleServiceProvider()
    entityManager.persist(accommodationServiceCategory)
    entityManager.persist(harmonyLivingServiceProvider)
    entityManager.flush()

    val npsRegion = sampleNPSRegion()
    entityManager.persistAndFlush(npsRegion)

    val harmonyLivingContract = sampleContract(
      serviceCategory = accommodationServiceCategory,
      serviceProvider = harmonyLivingServiceProvider,
      npsRegion = npsRegion,
    )
    entityManager.persistAndFlush(harmonyLivingContract)

    val intervention: Intervention = sampleIntervention(dynamicFrameworkContract = harmonyLivingContract)
    entityManager.persist(intervention)
    val intervention2: Intervention = sampleIntervention(dynamicFrameworkContract = harmonyLivingContract)
    entityManager.persist(intervention2)
    entityManager.flush()

    val interventions = interventionService.getInterventionsForServiceProvider("HARMONY_LIVING")
    assertThat(interventions.size).isEqualTo(2)
    assertThat(interventions[0].dynamicFrameworkContract.id).isEqualTo(interventions[0].dynamicFrameworkContract.id)

    val contractId = interventions[0].dynamicFrameworkContract.id
    entityManager.remove(intervention)
    entityManager.remove(intervention2)
    assertThat(entityManager.find(DynamicFrameworkContract::class.java, contractId)).isNotNull
  }
}
