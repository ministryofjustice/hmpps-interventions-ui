package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import com.microsoft.applicationinsights.boot.dependencies.apachecommons.lang3.RandomStringUtils
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ContractType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.NPSRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.PCCRegion
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import java.time.LocalDate
import java.util.UUID

class DynamicFrameworkContractFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val serviceProviderFactory = ServiceProviderFactory(em)
  private val contractTypeFactory = ContractTypeFactory(em)

  fun create(
    id: UUID = UUID.randomUUID(),
    contractType: ContractType = contractTypeFactory.create(),
    primeProvider: ServiceProvider = serviceProviderFactory.create(),
    startDate: LocalDate = LocalDate.of(2021, 6, 1),
    endDate: LocalDate = LocalDate.of(2026, 6, 1),
    minimumAge: Int = 18,
    maximumAge: Int? = null,
    allowsMale: Boolean = true,
    allowsFemale: Boolean = true,
    npsRegion: NPSRegion? = null,
    pccRegion: PCCRegion? = null,
    contractReference: String = RandomStringUtils.randomAlphanumeric(8),
    subcontractorProviders: Set<ServiceProvider> = setOf(),
  ): DynamicFrameworkContract {
    return save(
      DynamicFrameworkContract(
        id = id,
        contractType = contractType,
        primeProvider = primeProvider,
        startDate = startDate,
        endDate = endDate,
        minimumAge = minimumAge,
        maximumAge = maximumAge,
        allowsMale = allowsMale,
        allowsFemale = allowsFemale,
        npsRegion = npsRegion,
        pccRegion = pccRegion,
        contractReference = contractReference,
        subcontractorProviders = subcontractorProviders
      )
    )
  }
}
