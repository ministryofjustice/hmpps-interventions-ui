package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.LocalDate
import java.time.LocalTime
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

@DataJpaTest
@ActiveProfiles("jpa-test")
class ReferralServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val referralRepository: ReferralRepository
) {

  private val referralService = ReferralService(referralRepository)

  @Test
  fun `update cannot overwrite identifier fields`() {
    val referral = Referral()
    entityManager.persist(referral)
    entityManager.flush()

    val draftReferral = DraftReferral(
      id = UUID.fromString("ce364949-7301-497b-894d-130f34a98bff"),
      created = OffsetDateTime.of(LocalDate.of(2020, 12, 1), LocalTime.MIN, ZoneOffset.UTC)
    )

    val updated = referralService.updateDraftReferral(referral.id!!, draftReferral)
    assertThat(updated!!.id).isEqualTo(referral.id!!)
    assertThat(updated.created).isEqualTo(referral.created)
  }

  @Test
  fun `null fields in the update do not overwrite original fields`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val draftReferral = DraftReferral(completionDeadline = null)

    val updated = referralService.updateDraftReferral(referral.id!!, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(LocalDate.of(2021, 6, 26))
  }

  @Test
  fun `non-null fields in the update overwrite original fields`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val draftReferral = DraftReferral(completionDeadline = LocalDate.of(2020, 12, 1))

    val updated = referralService.updateDraftReferral(referral.id!!, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(LocalDate.of(2020, 12, 1))
  }

  @Test
  fun `update mutates the original object`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val draftReferral = DraftReferral(completionDeadline = LocalDate.of(2020, 12, 1))

    val updated = referralService.updateDraftReferral(referral.id!!, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(LocalDate.of(2020, 12, 1))
  }

  @Test
  fun `update successfully persists the updated draft referral`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val draftReferral = DraftReferral(completionDeadline = LocalDate.of(2020, 12, 1))
    referralService.updateDraftReferral(referral.id!!, draftReferral)

    val savedDraftReferral = referralService.getDraftReferral(referral.id!!)
    assertThat(savedDraftReferral!!.id).isEqualTo(referral.id)
    assertThat(savedDraftReferral.created).isEqualTo(referral.created)
    assertThat(savedDraftReferral.completionDeadline).isEqualTo(draftReferral.completionDeadline)
  }

  @Test
  fun `create and persist draft referral`() {
    val draftReferral = referralService.createDraftReferral()
    entityManager.flush()

    val savedDraftReferral = referralService.getDraftReferral(draftReferral.id!!)
    assertThat(savedDraftReferral!!.id).isNotNull
    assertThat(savedDraftReferral.created).isNotNull
  }

  @Test
  fun `get a draft referral`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val savedDraftReferral = referralService.getDraftReferral(referral.id!!)
    assertThat(savedDraftReferral!!.id).isEqualTo(referral.id)
    assertThat(savedDraftReferral.created).isEqualTo(referral.created)
    assertThat(savedDraftReferral.completionDeadline).isEqualTo(referral.completionDeadline)
  }

  @Test
  fun `find by userID returns list of draft referrals`() {
    val referrals = listOf(
      Referral(createdByUserID = "123"),
      Referral(createdByUserID = "123"),
      Referral(createdByUserID = "456"),
    )
    referrals.forEach { entityManager.persist(it) }
    entityManager.flush()

    val single = referralService.getDraftReferralsCreatedByUserID("456")
    assertThat(single).hasSize(1)

    val multiple = referralService.getDraftReferralsCreatedByUserID("123")
    assertThat(multiple).hasSize(2)

    val none = referralService.getDraftReferralsCreatedByUserID("789")
    assertThat(none).hasSize(0)
  }
}
