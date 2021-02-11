package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthGroupID
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider

class ServiceProviderFactory(em: TestEntityManager) : EntityFactory(em) {
  fun create(
    id: AuthGroupID = "HARMONY_LIVING",
    name: String = "Harmony Living",
    incomingReferralDistributionEmail: String = "harmony@example.com",
  ): ServiceProvider {
    return save(
      ServiceProvider(
        id = id,
        name = name,
        incomingReferralDistributionEmail = incomingReferralDistributionEmail
      )
    )
  }
}
