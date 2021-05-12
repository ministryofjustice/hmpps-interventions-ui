package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DynamicFrameworkContract
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.DynamicFrameworkContractRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ServiceProviderRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.HMPPSAuthService
import java.lang.RuntimeException

data class UserAccessScope(
  val serviceProvider: ServiceProvider,
  val contracts: List<DynamicFrameworkContract>,
)

@Component
class UserAccessScopeMapper(
  private val hmppsAuthService: HMPPSAuthService,
  private val serviceProviderRepository: ServiceProviderRepository,
  private val dynamicFrameworkContractRepository: DynamicFrameworkContractRepository,
) {
  private val serviceProviderGroupPrefix = "INT_SP_"
  private val contractGroupPrefix = "INT_CG_"

  // get the user access scope for a given service provider user
  fun forServiceProviderUser(user: AuthUser): UserAccessScope {
    val groups = hmppsAuthService.getUserGroups(user)
      ?: throw RuntimeException("pp or non existent user")

    val serviceProviderGroups = groups
      .filter { it.startsWith(serviceProviderGroupPrefix) }
      .map { it.removePrefix(serviceProviderGroupPrefix) }

    if (serviceProviderGroups.size != 1) {
      throw RuntimeException("there must only be one service provider group per user")
    }

    val contractGroups = groups
      .filter { it.startsWith(contractGroupPrefix) }
      .map { it.removePrefix(contractGroupPrefix) }

    val serviceProvider = serviceProviderRepository.findByIdOrNull(serviceProviderGroups[0])
      ?: throw RuntimeException("service provider does not exist in our database")

    val contracts = dynamicFrameworkContractRepository.findAllByContractReferenceIn(contractGroups)

    return UserAccessScope(serviceProvider = serviceProvider, contracts = contracts)
  }
}
