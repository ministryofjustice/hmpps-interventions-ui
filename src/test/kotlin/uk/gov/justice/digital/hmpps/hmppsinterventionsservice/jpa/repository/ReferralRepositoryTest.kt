package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.data.repository.findByIdOrNull
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class ReferralRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
) {
  private val authUserFactory = AuthUserFactory(entityManager)

  @Test
  fun `removing a referral does not remove associated auth_user`() {
    val user = authUserFactory.create(id = "referral_repository_test_user_id")
    val referral = SampleData.sampleReferral("X123456", "Harmony Living", createdBy = user)
    SampleData.persistReferral(entityManager, referral)

    // check that when the referral is deleted, the user is not
    entityManager.remove(referral)
    Assertions.assertThat(referralRepository.findByIdOrNull(referral.id)).isNull()
    val userAfterDelete = authUserRepository.findByIdOrNull(user.id)
    Assertions.assertThat(userAfterDelete).isNotNull
    Assertions.assertThat(userAfterDelete).isEqualTo(user)
  }
}
