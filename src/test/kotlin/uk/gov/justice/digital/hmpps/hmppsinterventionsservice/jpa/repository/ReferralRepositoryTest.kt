package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.data.repository.findByIdOrNull
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

@DataJpaTest
class ReferralRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository
) {

  @Test
  fun `when findByIdOrNull then return referral`() {
    val referrals = listOf(Referral(), Referral())
    referrals.forEach { entityManager.persist(it) }
    entityManager.flush()

    val found = referralRepository.findByIdOrNull(referrals[0].id!!)
    Assertions.assertThat(found).isEqualTo(referrals[0])
  }
}
