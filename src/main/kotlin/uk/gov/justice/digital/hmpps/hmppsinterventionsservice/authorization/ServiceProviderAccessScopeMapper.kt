package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.AccessError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DynamicFrameworkContractRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceProviderRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService

data class ServiceProviderAccessScope(
  val serviceProvider: ServiceProvider,
  val contracts: List<DynamicFrameworkContract>,
)

@Component
class ServiceProviderAccessScopeMapper(
  private val hmppsAuthService: HMPPSAuthService,
  private val serviceProviderRepository: ServiceProviderRepository,
  private val dynamicFrameworkContractRepository: DynamicFrameworkContractRepository,
  private val userTypeChecker: UserTypeChecker,
) {
  private val serviceProviderGroupPrefix = "INT_SP_"
  private val contractGroupPrefix = "INT_CR_"
  private val errorMessage = "could not map service provider user to access scope"

  fun fromUser(user: AuthUser): ServiceProviderAccessScope {
    if (!userTypeChecker.isServiceProviderUser(user)) {
      throw AccessError(user, errorMessage, listOf("user is not a service provider"))
    }

    val groups = hmppsAuthService.getUserGroups(user)
      ?: throw AccessError(user, errorMessage, listOf("cannot find user in hmpps auth"))

    val configErrors = mutableListOf<String>()

    val serviceProviderGroups = groups
      .filter { it.startsWith(serviceProviderGroupPrefix) }
      .map { it.removePrefix(serviceProviderGroupPrefix) }

    val serviceProvider = getServiceProvider(serviceProviderGroups, configErrors)

    val contractGroups = groups
      .filter { it.startsWith(contractGroupPrefix) }
      .map { it.removePrefix(contractGroupPrefix) }

    val contracts = getContracts(contractGroups, configErrors)

    // FIXME we also need to remove contracts which do not belong to the user's provider

    if (configErrors.isNotEmpty()) {
      throw AccessError(user, errorMessage, configErrors)
    }

    // this not null assertion on serviceProvider is ugly, but it's the only way i could think
    // of to allow all the errors to be processed in a sensible way above.
    return ServiceProviderAccessScope(serviceProvider = serviceProvider!!, contracts = contracts)
  }

  private fun getServiceProvider(serviceProviderGroups: List<String>, configErrors: MutableList<String>): ServiceProvider? {
    return when {
      serviceProviderGroups.isEmpty() -> {
        configErrors.add("no service provider groups associated with user")
        null
      }
      serviceProviderGroups.size > 1 -> {
        configErrors.add("more than one service provider group associated with user")
        null
      }
      else -> {
        val providerGroupCode = serviceProviderGroups[0]
        val provider = serviceProviderRepository.findByIdOrNull(providerGroupCode)
        if (provider == null) {
          configErrors.add("service provider id '$providerGroupCode' does not exist in the interventions database")
        }
        provider
      }
    }
  }

  private fun getContracts(contractGroups: List<String>, configErrors: MutableList<String>): List<DynamicFrameworkContract> {
    return if (contractGroups.isEmpty()) {
      configErrors.add("no contract groups associated with user")
      emptyList()
    } else {
      val contracts = dynamicFrameworkContractRepository.findAllByContractReferenceIn(contractGroups)
      val removedContracts = contractGroups.subtract(contracts.map(DynamicFrameworkContract::contractReference))
      for (removedContract in removedContracts) {
        configErrors.add("contract '$removedContract' does not exist in the interventions database")
      }
      contracts
    }
  }
}
