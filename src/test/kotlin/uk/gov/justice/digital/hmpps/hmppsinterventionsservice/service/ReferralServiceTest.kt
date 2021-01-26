package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import org.springframework.test.context.ActiveProfiles
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.config.ValidationError
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DraftReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
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
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
  private val referralEventPublisher: ReferralEventPublisher,
) {

  private val referralService = ReferralService(referralRepository, authUserRepository, referralEventPublisher)

  @Test
  fun `update cannot overwrite identifier fields`() {
    val referral = Referral(serviceUserCRN = "X123456")
    entityManager.persist(referral)
    entityManager.flush()

    val draftReferral = DraftReferralDTO(
      id = UUID.fromString("ce364949-7301-497b-894d-130f34a98bff"),
      createdAt = OffsetDateTime.of(LocalDate.of(2020, 12, 1), LocalTime.MIN, ZoneOffset.UTC)
    )

    val updated = referralService.updateDraftReferral(referral, draftReferral)
    assertThat(updated!!.id).isEqualTo(referral.id!!)
    assertThat(updated.createdAt).isEqualTo(referral.createdAt)
  }

  @Test
  fun `null fields in the update do not overwrite original fields`() {
    val referral = Referral(serviceUserCRN = "X123456", completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val draftReferral = DraftReferralDTO(completionDeadline = null)

    val updated = referralService.updateDraftReferral(referral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(LocalDate.of(2021, 6, 26))
  }

  @Test
  fun `non-null fields in the update overwrite original fields`() {
    val referral = Referral(serviceUserCRN = "X123456", completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)

    val updated = referralService.updateDraftReferral(referral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(today)
  }

  @Test
  fun `update mutates the original object`() {
    val referral = Referral(serviceUserCRN = "X123456", completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)

    val updated = referralService.updateDraftReferral(referral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(today)
  }

  @Test
  fun `update successfully persists the updated draft referral`() {
    val referral = Referral(serviceUserCRN = "X123456", completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)
    referralService.updateDraftReferral(referral, draftReferral)

    val savedDraftReferral = referralService.getDraftReferral(referral.id!!)
    assertThat(savedDraftReferral!!.id).isEqualTo(referral.id)
    assertThat(savedDraftReferral.createdAt).isEqualTo(referral.createdAt)
    assertThat(savedDraftReferral.completionDeadline).isEqualTo(draftReferral.completionDeadline)
  }

  @Test
  fun `create and persist draft referral`() {
    val authUser = AuthUser("user_id", "auth_source")
    val draftReferral = referralService.createDraftReferral(authUser, "X123456")
    entityManager.flush()

    val savedDraftReferral = referralService.getDraftReferral(draftReferral.id!!)
    assertThat(savedDraftReferral!!.id).isNotNull
    assertThat(savedDraftReferral.createdAt).isNotNull
    assertThat(savedDraftReferral.createdBy).isEqualTo(authUser)
    assertThat(savedDraftReferral.serviceUserCRN).isEqualTo("X123456")
  }

  @Test
  fun `get a draft referral`() {
    val referral = Referral(serviceUserCRN = "X123456", completionDeadline = LocalDate.of(2021, 6, 26))
    entityManager.persist(referral)
    entityManager.flush()

    val savedDraftReferral = referralService.getDraftReferral(referral.id!!)
    assertThat(savedDraftReferral!!.id).isEqualTo(referral.id)
    assertThat(savedDraftReferral.createdAt).isEqualTo(referral.createdAt)
    assertThat(savedDraftReferral.completionDeadline).isEqualTo(referral.completionDeadline)
  }

  @Test
  fun `find by userID returns list of draft referrals`() {
    val user1 = AuthUser("123", "delius")
    val user2 = AuthUser("456", "delius")
    referralService.createDraftReferral(user1, "X123456")
    referralService.createDraftReferral(user1, "X123456")
    referralService.createDraftReferral(user2, "X123456")
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
    val referral = Referral(serviceUserCRN = "X123456")
    val update = DraftReferralDTO(completionDeadline = LocalDate.of(2020, 1, 1))
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, update)
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("completionDeadline")
  }

  @Test
  fun `service category cannot be changed once set`() {
    var referral = Referral(serviceUserCRN = "X123456")
    val update = DraftReferralDTO(serviceCategoryId = UUID.fromString("428ee70f-3001-4399-95a6-ad25eaaede16"))

    referral = referralService.updateDraftReferral(referral, update)

    // this is fine, since the service category is the same
    referralService.updateDraftReferral(referral, update)

    val updateWithDifferentServiceCategory = DraftReferralDTO(serviceCategoryId = UUID.fromString("9556a399-3529-4993-8030-41db2090555e"))

    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, updateWithDifferentServiceCategory)
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("serviceCategoryId")
  }

  @Test
  fun `setting complexity level id requires service category`() {
    var referral = Referral(serviceUserCRN = "X123456")
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
    val referral = Referral(serviceUserCRN = "X123456")
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
    val referral = Referral(serviceUserCRN = "X123456")
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
  fun `when usingRarDays is true, maximumRarDays must be set`() {
    val referral = Referral(serviceUserCRN = "X123456")
    // this is fine
    referralService.updateDraftReferral(referral, DraftReferralDTO(usingRarDays = false))

    val error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(referral, DraftReferralDTO(usingRarDays = true))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("usingRarDays")

    // this is also fine
    referralService.updateDraftReferral(referral, DraftReferralDTO(usingRarDays = true, maximumRarDays = 12))
  }

  @Test
  fun `setting desired outcomes requires service category`() {
    var referral = Referral(serviceUserCRN = "X123456")
    val update = DraftReferralDTO(desiredOutcomeIds = mutableListOf(UUID.fromString("8e77d70e-52a8-428f-9372-070e12e93154")))
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, update)
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("desiredOutcomeIds")

    val updateWithServiceCategory = DraftReferralDTO(
      desiredOutcomeIds = listOf(UUID.fromString("8e77d70e-52a8-428f-9372-070e12e93154")),
      serviceCategoryId = UUID.fromString("428ee70f-3001-4399-95a6-ad25eaaede16")
    )
    referral = referralService.updateDraftReferral(referral, updateWithServiceCategory)
    assertThat(referral.serviceCategoryID).isNotNull
    assertThat(referral.desiredOutcomeIDs).size().isEqualTo(1)
    assertThat(referral.desiredOutcomeIDs).contains(UUID.fromString("8e77d70e-52a8-428f-9372-070e12e93154"))

    // now service category has been set in the previous step, the desired outcomes can be updated
    // without the service category in the update fields
    val updateWithNewDesiredOutcomes = DraftReferralDTO(desiredOutcomeIds = mutableListOf(UUID.fromString("9b30ffad-dfcb-44ce-bdca-0ea49239a21a")))
    referral = referralService.updateDraftReferral(referral, updateWithNewDesiredOutcomes)
    assertThat(referral.desiredOutcomeIDs).size().isEqualTo(1)
    assertThat(referral.desiredOutcomeIDs).contains(UUID.fromString("9b30ffad-dfcb-44ce-bdca-0ea49239a21a"))
  }

  @Test
  fun `desired outcomes, once set, can not be reset back to null or empty`() {
    var referral = Referral(serviceUserCRN = "X123456")

    val updateWithServiceCategory = DraftReferralDTO(
      desiredOutcomeIds = mutableListOf(
        UUID.fromString("301ead30-30a4-4c7c-8296-2768abfb59b5"),
        UUID.fromString("9b30ffad-dfcb-44ce-bdca-0ea49239a21a")
      ),
      serviceCategoryId = UUID.fromString("428ee70f-3001-4399-95a6-ad25eaaede16")
    )
    referral = referralService.updateDraftReferral(referral, updateWithServiceCategory)
    assertThat(referral.desiredOutcomeIDs).size().isEqualTo(2)

    var error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(referral, DraftReferralDTO(desiredOutcomeIds = mutableListOf()))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("desiredOutcomeIds")

    // update with null is ignored
    referralService.updateDraftReferral(referral, DraftReferralDTO(desiredOutcomeIds = null))

    // Ensure no changes
    referral = referralService.getDraftReferral(referral.id!!)!!
    assertThat(referral.desiredOutcomeIDs).size().isEqualTo(2)
  }

  @Test
  fun `multiple errors at once`() {
    val referral = Referral(serviceUserCRN = "X123456")
    val update = DraftReferralDTO(completionDeadline = LocalDate.of(2020, 1, 1), needsInterpreter = true)
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(referral, update)
    }
    assertThat(error.errors.size).isEqualTo(2)
  }

  @Test
  fun `the referral isn't actually updated if any of the fields contain validation errors`() {
    val referral = Referral(serviceUserCRN = "X123456")
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

  @Test
  fun `once a draft referral is sent it's id is no longer is a valid draft referral`() {
    val user = AuthUser("user_id", "auth_source")
    val draftReferral = referralService.createDraftReferral(user, "X123456")

    assertThat(referralService.getDraftReferral(draftReferral.id!!)).isNotNull()

    val sentReferral = referralService.sendDraftReferral(draftReferral, user)

    assertThat(referralService.getDraftReferral(draftReferral.id!!)).isNull()
    assertThat(referralService.getSentReferral(sentReferral.id!!)).isNotNull()
  }

  @Test
  fun `multiple draft referrals can be started by the same user`() {
    for (i in 1..3) {
      val user = AuthUser("multi_user_id", "auth_source")
      assertDoesNotThrow { referralService.createDraftReferral(user, "X123456") }
    }
    assertThat(referralService.getDraftReferralsCreatedByUserID("multi_user_id")).hasSize(3)
  }
}
