package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

class SampleData {
  companion object {
    // there are tonnes of related tables that need to exist to successfully persist an intervention,
    // this is a helper method that persists them all
    fun persistIntervention(em: TestEntityManager, intervention: Intervention): Intervention {
      em.persist(intervention.dynamicFrameworkContract.serviceCategory)
      em.persist(intervention.dynamicFrameworkContract.serviceProvider)
//      em.persist(intervention.dynamicFrameworkContract.contractEligibility)
      intervention.dynamicFrameworkContract.npsRegion?.let { npsRegion ->
        em.persist(npsRegion)
      }
      intervention.dynamicFrameworkContract.pccRegion?.let { pccRegion ->
        em.persist(pccRegion)
      }
      em.persist(intervention.dynamicFrameworkContract)
      return em.persistAndFlush(intervention)
    }

    fun persistReferral(em: TestEntityManager, referral: Referral): Referral {
      persistIntervention(em, referral.intervention)
      return em.persistAndFlush(referral)
    }

    fun sampleReferral(
      crn: String,
      serviceProviderName: String,
      id: UUID? = null,
      referenceNumber: String? = null,
      completionDeadline: LocalDate? = null
    ): Referral {
      return Referral(
        serviceUserCRN = crn,
        id = id,
        completionDeadline = completionDeadline,
        referenceNumber = referenceNumber,
        intervention = sampleIntervention(
          dynamicFrameworkContract = sampleContract(
            serviceCategory = sampleServiceCategory(desiredOutcomes = emptyList()),
            serviceProvider = sampleServiceProvider(id = serviceProviderName, name = serviceProviderName),
          )
        )
      )
    }

    fun sampleIntervention(
      title: String = "Accommodation Service",
      description: String = "Help find sheltered housing",
      dynamicFrameworkContract: DynamicFrameworkContract
    ): Intervention {
      return Intervention(
        title = title,
        description = description,
        dynamicFrameworkContract = dynamicFrameworkContract
      )
    }

    fun sampleContract(
      startDate: LocalDate = LocalDate.of(2020, 12, 1),
      endDate: LocalDate = LocalDate.of(2021, 12, 1),
      serviceCategory: ServiceCategory,
      serviceProvider: ServiceProvider,
      npsRegion: NPSRegion? = null,
      pccRegion: PCCRegion? = null,
      contractEligibility: ContractEligibility = ContractEligibility(allowsFemale = true, allowsMale = true, minimumAge = 18, maximumAge = 25)
    ): DynamicFrameworkContract {
      return DynamicFrameworkContract(
        serviceCategory = serviceCategory,
        serviceProvider = serviceProvider,
        startDate = startDate,
        endDate = endDate,
        contractEligibility = contractEligibility,
        npsRegion = npsRegion,
        pccRegion = pccRegion
      )
    }

    fun sampleNPSRegion(
      id: Char = 'G',
      name: String = "South West"
    ): NPSRegion {
      return NPSRegion(
        id = id,
        name = name
      )
    }

    fun samplePCCRegion(
      id: String = "avon-and-somerset",
      name: String = "Avon & Somerset",
      npsRegion: NPSRegion = sampleNPSRegion(),
    ): PCCRegion {
      return PCCRegion(
        id = id,
        name = name,
        npsRegion = npsRegion
      )
    }

    fun sampleServiceProvider(
      id: AuthGroupID = "HARMONY_LIVING",
      name: String = "Harmony Living",
      emailAddress: String = "contact@harmonyLiving.com",
    ): ServiceProvider {
      return ServiceProvider(id, name, emailAddress)
    }

    fun sampleServiceCategory(
      desiredOutcomes: List<DesiredOutcome>,
      name: String = "Accommodation",
      id: UUID = UUID.randomUUID(),
      created: OffsetDateTime = OffsetDateTime.now(),
      complexityLevels: List<ComplexityLevel> = emptyList()
    ): ServiceCategory {

      return ServiceCategory(
        name = name,
        id = id,
        created = created,
        complexityLevels = complexityLevels,
        desiredOutcomes = desiredOutcomes
      )
    }

    fun sampleDesiredOutcome(id: UUID = UUID.randomUUID(), description: String = "Outcome 1"): DesiredOutcome {
      return DesiredOutcome(id, description)
    }

    fun persistPCCRegion(em: TestEntityManager, pccRegion: PCCRegion): PCCRegion {
      em.persist(pccRegion.npsRegion)
      return em.persistAndFlush(pccRegion)
    }
  }
}
