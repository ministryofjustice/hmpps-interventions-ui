package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import java.util.UUID

@RepositoryTest
class ServiceProviderServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository
) {
  private val serviceProviderService = ServiceProviderService(referralRepository)
  private val referralFactory = ReferralFactory(entityManager)
  @Nested
  inner class GetServiceProviderByReferralId {
    @Test
    fun `get service provider with unknown id returns null`() {
      Assertions.assertThat(serviceProviderService.getServiceProviderByReferralId(UUID.randomUUID())).isNull()
    }
    @Test
    fun `get service provider with known referral id returns service provider`() {
      val referral = referralFactory.createSent()
      val serviceProvider = serviceProviderService.getServiceProviderByReferralId(referral.id)
      Assertions.assertThat(serviceProvider).isNotNull
      Assertions.assertThat(serviceProvider).isEqualTo(referral.intervention.dynamicFrameworkContract.primeProvider)
    }
  }
}
