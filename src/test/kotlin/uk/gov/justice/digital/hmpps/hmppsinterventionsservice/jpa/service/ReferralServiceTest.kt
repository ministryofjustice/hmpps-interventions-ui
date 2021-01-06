package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.service
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
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

    val draftReferral = DraftReferralDTO(
      id = UUID.fromString("ce364949-7301-497b-894d-130f34a98bff"),
      created = OffsetDateTime.of(LocalDate.of(2020, 12, 1), LocalTime.MIN, ZoneOffset.UTC)
    )

    val updated = referralService.updateDraftReferral(referral, draftReferral)
    assertThat(updated!!.id).isEqualTo(referral.id!!)
    assertThat(updated.created).isEqualTo(referral.created)
  }

  @Test
  fun `null fields in the update do not overwrite original fields`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val draftReferral = DraftReferralDTO(completionDeadline = null)

    val updated = referralService.updateDraftReferral(referral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(LocalDate.of(2021, 6, 26))
  }

  @Test
  fun `non-null fields in the update overwrite original fields`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)

    val updated = referralService.updateDraftReferral(referral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(today)
  }

  @Test
  fun `update mutates the original object`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)

    val updated = referralService.updateDraftReferral(referral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(today)
  }

  @Test
  fun `update successfully persists the updated draft referral`() {
    val referral = Referral(completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)
    referralService.updateDraftReferral(referral, draftReferral)

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

  @Test
  fun `completion date must be in the future`() {
    val referral = Referral()
    val update = DraftReferralDTO(completionDeadline = LocalDate.of(2020, 1, 1))
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, update)
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("completionDeadline")
  }

  @Test
  fun `service category cannot be changed once set`() {
    var referral = Referral()
    val update = DraftReferralDTO(serviceCategoryId = UUID.fromString("428ee70f-3001-4399-95a6-ad25eaaede16"))

    referral = referralService.updateDraftReferral(referral, update)

    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, update)
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("serviceCategoryId")
  }

  @Test
  fun `setting complexity level id requires service category`() {
    var referral = Referral()
    val update = DraftReferralDTO(complexityLevelId = UUID.fromString("110f2405-d944-4c15-836c-0c6684e2aa78"))
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, update)
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("complexityLevelId")

    val updateWithServiceCategory = DraftReferralDTO(
      complexityLevelId = UUID.fromString("110f2405-d944-4c15-836c-0c6684e2aa78"),
      serviceCategoryId = UUID.fromString("428ee70f-3001-4399-95a6-ad25eaaede16")
    )
    referral = referralService.updateDraftReferral(referral, updateWithServiceCategory)
    assertThat(referral.complexityLevelID.toString()).isEqualTo("110f2405-d944-4c15-836c-0c6684e2aa78")

    // now service category has been set in the previous step i can update the complexity level
    // without the service category in the update fields
    val updateWithNewComplexityLevel = DraftReferralDTO(complexityLevelId = UUID.fromString("c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6"))
    referral = referralService.updateDraftReferral(referral, updateWithNewComplexityLevel)
    assertThat(referral.complexityLevelID.toString()).isEqualTo("c86be5ec-31fa-4dfa-8c0c-8fe13451b9f6")
  }

  @Test
  fun `when needsInterpreter is true, interpreterLanguage must be set`() {
    val referral = Referral()
    // this is fine
    referralService.updateDraftReferral(referral, DraftReferralDTO(needsInterpreter = false))

    val error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(referral, DraftReferralDTO(needsInterpreter = true))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("needsInterpreter")

    // this is also fine
    referralService.updateDraftReferral(referral, DraftReferralDTO(needsInterpreter = true, interpreterLanguage = "German"))
  }

  @Test
  fun `when hasAdditionalResponsibilities is true, whenUnavailable must be set`() {
    val referral = Referral()
    // this is fine
    referralService.updateDraftReferral(referral, DraftReferralDTO(hasAdditionalResponsibilities = false))

    val error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(referral, DraftReferralDTO(hasAdditionalResponsibilities = true))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("hasAdditionalResponsibilities")

    // this is also fine
    referralService.updateDraftReferral(referral, DraftReferralDTO(hasAdditionalResponsibilities = true, whenUnavailable = "wednesdays"))
  }

  @Test
  fun `multiple errors at once`() {
    val referral = Referral()
    val update = DraftReferralDTO(completionDeadline = LocalDate.of(2020, 1, 1), needsInterpreter = true)
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, update)
    }
    assertThat(error.errors.size).isEqualTo(2)
  }

  @Test
  fun `the referral isn't actually updated if any of the fields contain validation errors`() {
    val referral = Referral()
    entityManager.persist(referral)
    entityManager.flush()

    // any invalid fields should mean that no fields are written to the db
    val update = DraftReferralDTO(
      // valid field
      serviceCategoryId = UUID.fromString("428ee70f-3001-4399-95a6-ad25eaaede16"),
      // invalid field
      completionDeadline = LocalDate.of(2020, 1, 1),
    )
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, update)
    }

    entityManager.flush()
    assertThat(referralService.getDraftReferral(referral.id!!)!!.serviceCategoryID).isNull()
  }
}
