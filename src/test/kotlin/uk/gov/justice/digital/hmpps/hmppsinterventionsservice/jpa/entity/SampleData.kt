package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

class SampleData {

  companion object {
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
      region: NPSRegion
    ): PCCRegion {
      return PCCRegion(
        id = id,
        name = name,
        region = region
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
  }
}
