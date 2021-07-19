package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.data.repository.findByIdOrNull
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceUserFactory
import java.time.OffsetDateTime

@RepositoryTest
class ReferralRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
) {
  private val authUserFactory = AuthUserFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)
  private val serviceUserFactory = ServiceUserFactory(entityManager)
  @Test
  fun `removing a referral does not remove associated auth_user`() {
    val user = authUserFactory.create(id = "referral_repository_test_user_id")
    val referral = SampleData.sampleReferral("X123456", "Harmony Living", createdBy = user)
    SampleData.persistReferral(entityManager, referral)

    // check that when the referral is deleted, the user is not
    entityManager.remove(referral)
    assertThat(referralRepository.findByIdOrNull(referral.id)).isNull()
    val userAfterDelete = authUserRepository.findByIdOrNull(user.id)
    assertThat(userAfterDelete).isNotNull
    assertThat(userAfterDelete).isEqualTo(user)
  }

  @Nested
  inner class ReferralSummaryForServiceProviders {
    @Test
    fun `can obtain a single referral summary`() {

      val user = authUserFactory.create()
      val referral = referralFactory.createSent(assignments = listOf(ReferralAssignment(OffsetDateTime.now(), assignedBy = user, assignedTo = user)))
      serviceUserFactory.create("firstName", "lastName", referral)

      val summaries = referralRepository.referralSummaryForServiceProviders(listOf("HARMONY_LIVING"))

      assertThat(summaries.size).isEqualTo(1)
      assertThat(summaries.get(0).referenceNumber).isEqualTo("JS18726AC")
      assertThat(summaries.get(0).interventionTitle).isEqualTo("Sheffield Housing Services")
      assertThat(summaries.get(0).assignedToUserName).isEqualTo("bernard.beaks")
      assertThat(summaries.get(0).serviceUserFirstName).isEqualTo("firstName")
      assertThat(summaries.get(0).serviceUserLastName).isEqualTo("lastName")
    }
  }
}
