package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization

import org.springframework.stereotype.Component
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider

@Component
class EligibleProviderMapper {
  // get the service providers who are eligible to access this referral
  fun fromReferral(referral: Referral): List<ServiceProvider> {
    return listOf(getPrimeProvider(referral)) + getSubcontractorProviders(referral)
  }

  private fun getPrimeProvider(referral: Referral): ServiceProvider {
    return referral.intervention.dynamicFrameworkContract.primeProvider
  }

  private fun getSubcontractorProviders(referral: Referral): List<ServiceProvider> {
    // todo: this is where we handle granting access to only providers with nominated access
    return referral.intervention.dynamicFrameworkContract.subcontractorProviders.toList()
  }
}
