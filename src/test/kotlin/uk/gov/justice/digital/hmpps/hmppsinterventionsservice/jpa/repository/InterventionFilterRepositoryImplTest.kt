package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import java.time.LocalDate

@DataJpaTest
@ActiveProfiles("jpa-test")
class InterventionFilterRepositoryImplTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val interventionFilterRepositoryImpl: InterventionFilterRepository
) {

  @Test
  fun `get interventions with no filters`() {
    saveMultipleInterventions()
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf())
    assertThat(found.size).isEqualTo(3)
  }

  @Test
  fun `get interventions filtering by location where only nps region interventions are available`() {
    saveMultipleInterventions()
    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("devon-and-cornwall"))

    assertThat(found.size).isEqualTo(2)
    found.forEach {
      assertThat(it.dynamicFrameworkContract.npsRegion?.id).isEqualTo('G')
    }
  }

//  @Test
//  fun `get interventions filtering by location where only pcc region interventions are available`() {
// //    saveMultipleInterventions()
//    //Correct data needs to be set up
//    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("devon-and-cornwall"))
//
//    Assertions.assertThat(found.size).isEqualTo(2)
//    found.forEach {
//      assert(it.dynamicFrameworkContract.pccRegion?.id.equals("devon-and-cornwall") || it.dynamicFrameworkContract.npsRegion?.id?.equals('G')!!)
//    }
//  }
//
//  @Test
//  fun `get interventions filtering by location where both pcc region and nps region interventions are available`() {
// //    saveMultipleInterventions()
//    //Correct data needs to be set up.
//    val found = interventionFilterRepositoryImpl.findByCriteria(listOf("devon-and-cornwall"))
//
//    Assertions.assertThat(found.size).isEqualTo(2)
//    found.forEach {
//      assert(it.dynamicFrameworkContract.pccRegion?.id.equals("devon-and-cornwall") || it.dynamicFrameworkContract.npsRegion?.id?.equals('G')!!)
//    }
//  }

  // Currently duplicated. To be replaced/update upon test changes being merged in a different pr.
  private fun saveMultipleInterventions() {
    val accommodationSC = SampleData.sampleServiceCategory()
    entityManager.persist(accommodationSC)

    // build map of service providers
    val serviceProviders = mapOf(
      "harmonyLiving" to ServiceProvider("HARMONY_LIVING", "Harmony Living", "contact@harmonyliving.com"),
      "homeTrust" to ServiceProvider("HOME_TRUST", "Home Trust", "manager@hometrust.com"),
      "liveWell" to ServiceProvider("LIVE_WELL", "Live Well", "contact@livewell.com")
    )

    serviceProviders.values.forEach { entityManager.persist(it) }
    entityManager.flush()

    val npsRegion = SampleData.sampleNPSRegion()
    entityManager.persistAndFlush(npsRegion)

    val pccRegionAvon = SampleData.samplePCCRegion(npsRegion = npsRegion)
    val pccRegionDevon = SampleData.samplePCCRegion(id = "devon-and-cornwall", name = "Devon & Cornwall", npsRegion = npsRegion)
    entityManager.persistAndFlush(pccRegionAvon)
    entityManager.persistAndFlush(pccRegionDevon)

    // build map of contracts
    val contracts = mapOf(
      "harmonyLiving1" to SampleData.sampleContract(
        serviceCategory = accommodationSC,
        serviceProvider = serviceProviders["harmonyLiving"]!!,
        npsRegion = npsRegion,
      ),
      "harmonyLiving2" to SampleData.sampleContract(
        serviceCategory = accommodationSC,
        serviceProvider = serviceProviders["harmonyLiving"]!!,
        startDate = LocalDate.of(2020, 11, 5),
        endDate = LocalDate.of(2022, 10, 7),
        npsRegion = npsRegion,
      ),
      "homeTrust" to SampleData.sampleContract(
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
      "intervention1" to SampleData.sampleIntervention(dynamicFrameworkContract = contracts["harmonyLiving1"]!!),
      "intervention2" to SampleData.sampleIntervention(dynamicFrameworkContract = contracts["harmonyLiving2"]!!),
      "intervention3" to SampleData.sampleIntervention(dynamicFrameworkContract = contracts["homeTrust"]!!)
    )
    interventions.values.forEach {
      entityManager.persistAndFlush(it)
    }
  }
}
