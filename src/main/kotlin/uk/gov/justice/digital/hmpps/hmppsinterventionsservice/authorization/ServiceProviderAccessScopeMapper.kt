package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

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

private data class WorkingScope(
  val authGroups: List<String>,
  val providers: MutableList<ServiceProvider> = mutableListOf(),
  val contracts: MutableList<DynamicFrameworkContract> = mutableListOf(),
  val errors: MutableList<String> = mutableListOf(),
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

    val workingScope = WorkingScope(authGroups = groups,)
    resolveProviders(workingScope)
    resolveContracts(workingScope)
    assertExactlyOneProvider(workingScope)
    assertAtLeastOneContract(workingScope)
    // FIXME we also need to remove contracts which do not belong to the user's provider

    if (workingScope.errors.isNotEmpty()) {
      throw AccessError(user, errorMessage, workingScope.errors)
    }

    // this implicit not null assertion on serviceProvider is ugly but `assertExactlyOneProvider` makes sure it is possible
    return ServiceProviderAccessScope(
      serviceProvider = workingScope.providers.first(),
      contracts = workingScope.contracts
    )
  }

  private fun resolveProviders(scope: WorkingScope) {
    val serviceProviderGroups = scope.authGroups
      .filter { it.startsWith(serviceProviderGroupPrefix) }
      .map { it.removePrefix(serviceProviderGroupPrefix) }

    val providers = getProviders(serviceProviderGroups, scope.errors)
    scope.providers.addAll(providers)
  }

  private fun resolveContracts(scope: WorkingScope) {
    val contractGroups = scope.authGroups
      .filter { it.startsWith(contractGroupPrefix) }
      .map { it.removePrefix(contractGroupPrefix) }

    val contracts = getContracts(contractGroups, scope.errors)
    scope.contracts.addAll(contracts)
  }

  private fun assertAtLeastOneContract(scope: WorkingScope) {
    if (scope.contracts.isEmpty()) {
      scope.errors.add("no valid contract groups associated with user")
    }
  }

  private fun assertExactlyOneProvider(scope: WorkingScope) {
    if (scope.providers.isEmpty()) {
      scope.errors.add("no valid service provider groups associated with user")
    }
    if (scope.providers.size > 1) {
      scope.errors.add("more than one service provider group associated with user")
    }
  }

  private fun getProviders(providerGroups: List<String>, configErrors: MutableList<String>): List<ServiceProvider> {
    val providers = serviceProviderRepository.findAllById(providerGroups)
    val removedProviders = providerGroups.subtract(providers.map { it.id })
    removedProviders.forEach { undefinedProvider ->
      configErrors.add("removed provider '$undefinedProvider' from scope: group does not exist in the reference data")
    }
    return providers
  }

  private fun getContracts(contractGroups: List<String>, configErrors: MutableList<String>): List<DynamicFrameworkContract> {
    val contracts = dynamicFrameworkContractRepository.findAllByContractReferenceIn(contractGroups)
    val removedContracts = contractGroups.subtract(contracts.map { it.contractReference })
    removedContracts.forEach { undefinedContract ->
      configErrors.add("removed contract '$undefinedContract' from scope: group does not exist in the reference data")
    }
    return contracts
  }
}
