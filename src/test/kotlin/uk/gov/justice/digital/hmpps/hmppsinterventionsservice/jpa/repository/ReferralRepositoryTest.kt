package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral

@DataJpaTest
@ActiveProfiles("jpa-test")
class ReferralRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
) {

  @Test
  fun `when findByIdOrNull then return referral`() {
    val referrals = listOf(Referral(serviceUserCRN = "X123456"), Referral(serviceUserCRN = "X123456"))
    referrals.forEach { entityManager.persist(it) }
    entityManager.flush()

    val found = referralRepository.findByIdOrNull(referrals[0].id!!)
    Assertions.assertThat(found).isEqualTo(referrals[0])
  }

  @Test
  fun `removing a referral does not remove associated auth_user`() {
    val user = AuthUser("user_id", "auth_source")
    entityManager.persist(user)
    val referral = Referral(serviceUserCRN = "X123456", createdBy = user)
    entityManager.persist(referral)
    entityManager.flush()

    // check that when the referral is deleted, the user is not
    entityManager.remove(referral)
    Assertions.assertThat(referralRepository.findAll() as List<Referral>).isEmpty()
    val usersAfterDelete = authUserRepository.findAll() as List<AuthUser>
    Assertions.assertThat(usersAfterDelete.size).isEqualTo(1)
    Assertions.assertThat(usersAfterDelete[0]).isEqualTo(user)
  }
}
