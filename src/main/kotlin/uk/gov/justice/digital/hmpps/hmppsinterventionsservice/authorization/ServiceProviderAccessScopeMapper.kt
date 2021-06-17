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
  val serviceProviders: List<ServiceProvider>,
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

    // order is important as each step can mutate WorkingScope
    val workingScope = WorkingScope(authGroups = groups)

    resolveProviders(workingScope)
    resolveContracts(workingScope)
    removeInaccessibleContracts(workingScope)

    blockUsersWithoutProviders(workingScope)
    blockUsersWithoutContracts(workingScope)

    if (workingScope.errors.isNotEmpty()) {
      throw AccessError(user, errorMessage, workingScope.errors)
    }

    return ServiceProviderAccessScope(
      serviceProviders = workingScope.providers,
      contracts = workingScope.contracts,
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

  private fun removeInaccessibleContracts(scope: WorkingScope) {
    val orphanContracts = scope.contracts.filterNot {
      scope.providers.contains(it.primeProvider) || it.subcontractorProviders.intersect(scope.providers).isNotEmpty()
    }
    orphanContracts.forEach {
      scope.errors.add("contract '${it.contractReference}' is not accessible to providers ${scope.providers.map { p -> p.id }}")
    }
    scope.contracts.removeAll(orphanContracts)
  }

  private fun blockUsersWithoutContracts(scope: WorkingScope) {
    if (scope.contracts.isEmpty()) {
      scope.errors.add("no valid contract groups associated with user")
    }
  }

  private fun blockUsersWithoutProviders(scope: WorkingScope) {
    if (scope.providers.isEmpty()) {
      scope.errors.add("no valid service provider groups associated with user")
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
