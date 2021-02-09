package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider

class ServiceProviderDTO(
  val name: String,
  val id: String
) {
  companion object {
    fun from(serviceProvider: ServiceProvider): ServiceProviderDTO {
      return ServiceProviderDTO(name = serviceProvider.name, id=serviceProvider.id)
    }
  }
}
