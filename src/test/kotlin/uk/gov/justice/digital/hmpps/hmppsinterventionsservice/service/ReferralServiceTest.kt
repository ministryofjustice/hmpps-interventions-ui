package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
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
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.InterventionRepository
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
  val interventionRepository: InterventionRepository,
) {

  private val referralEventPublisher: ReferralEventPublisher = mock()
  private val referralService = ReferralService(
    referralRepository,
    authUserRepository,
    interventionRepository,
    referralEventPublisher
  )

  // reset before each test
  private lateinit var sampleReferral: Referral
  private lateinit var sampleIntervention: Intervention

  @BeforeEach
  fun beforeEach() {
    sampleReferral = SampleData.persistReferral(
      entityManager,
      SampleData.sampleReferral("X123456", "Harmony Living")
    )
    sampleIntervention = sampleReferral.intervention
  }

  @Test
  fun `update cannot overwrite identifier fields`() {
    val draftReferral = DraftReferralDTO(
      id = UUID.fromString("ce364949-7301-497b-894d-130f34a98bff"),
      createdAt = OffsetDateTime.of(LocalDate.of(2020, 12, 1), LocalTime.MIN, ZoneOffset.UTC)
    )

    val updated = referralService.updateDraftReferral(sampleReferral, draftReferral)
    assertThat(updated!!.id).isEqualTo(sampleReferral.id!!)
    assertThat(updated.createdAt).isEqualTo(sampleReferral.createdAt)
  }

  @Test
  fun `null fields in the update do not overwrite original fields`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val draftReferral = DraftReferralDTO(completionDeadline = null)

    val updated = referralService.updateDraftReferral(sampleReferral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(LocalDate.of(2021, 6, 26))
  }

  @Test
  fun `non-null fields in the update overwrite original fields`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)

    val updated = referralService.updateDraftReferral(sampleReferral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(today)
  }

  @Test
  fun `update mutates the original object`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)

    val updated = referralService.updateDraftReferral(sampleReferral, draftReferral)
    assertThat(updated!!.completionDeadline).isEqualTo(today)
  }

  @Test
  fun `update successfully persists the updated draft referral`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val today = LocalDate.now()
    val draftReferral = DraftReferralDTO(completionDeadline = today)
    referralService.updateDraftReferral(sampleReferral, draftReferral)

    val savedDraftReferral = referralService.getDraftReferral(sampleReferral.id!!)
    assertThat(savedDraftReferral!!.id).isEqualTo(sampleReferral.id)
    assertThat(savedDraftReferral.createdAt).isEqualTo(sampleReferral.createdAt)
    assertThat(savedDraftReferral.completionDeadline).isEqualTo(draftReferral.completionDeadline)
  }

  @Test
  fun `create and persist draft referral`() {
    val authUser = AuthUser("user_id", "auth_source", "user_name")
    val draftReferral = referralService.createDraftReferral(authUser, "X123456", sampleIntervention.id!!)
    entityManager.flush()

    val savedDraftReferral = referralService.getDraftReferral(draftReferral.id!!)
    assertThat(savedDraftReferral!!.id).isNotNull
    assertThat(savedDraftReferral.createdAt).isNotNull
    assertThat(savedDraftReferral.createdBy).isEqualTo(authUser)
    assertThat(savedDraftReferral.serviceUserCRN).isEqualTo("X123456")
  }

  @Test
  fun `get a draft referral`() {
    sampleReferral.completionDeadline = LocalDate.of(2021, 6, 26)
    entityManager.persistAndFlush(sampleReferral)

    val savedDraftReferral = referralService.getDraftReferral(sampleReferral.id!!)
    assertThat(savedDraftReferral!!.id).isEqualTo(sampleReferral.id)
    assertThat(savedDraftReferral.createdAt).isEqualTo(sampleReferral.createdAt)
    assertThat(savedDraftReferral.completionDeadline).isEqualTo(sampleReferral.completionDeadline)
  }

  @Test
  fun `find by userID returns list of draft referrals`() {
    val user1 = AuthUser("123", "delius", "bernie.b")
    val user2 = AuthUser("456", "delius", "sheila.h")
    referralService.createDraftReferral(user1, "X123456", sampleIntervention.id!!)
    referralService.createDraftReferral(user1, "X123456", sampleIntervention.id!!)
    referralService.createDraftReferral(user2, "X123456", sampleIntervention.id!!)
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
    val update = DraftReferralDTO(completionDeadline = LocalDate.of(2020, 1, 1))
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(sampleReferral, update)
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("completionDeadline")
  }

  @Test
  fun `when needsInterpreter is true, interpreterLanguage must be set`() {
    // this is fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(needsInterpreter = false))

    val error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(needsInterpreter = true))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("needsInterpreter")

    // this is also fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(needsInterpreter = true, interpreterLanguage = "German"))
  }

  @Test
  fun `when hasAdditionalResponsibilities is true, whenUnavailable must be set`() {
    // this is fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(hasAdditionalResponsibilities = false))

    val error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(hasAdditionalResponsibilities = true))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("hasAdditionalResponsibilities")

    // this is also fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(hasAdditionalResponsibilities = true, whenUnavailable = "wednesdays"))
  }

  @Test
  fun `when usingRarDays is true, maximumRarDays must be set`() {
    // this is fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(usingRarDays = false))

    val error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(usingRarDays = true))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("usingRarDays")

    // this is also fine
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(usingRarDays = true, maximumRarDays = 12))
  }

  @Test
  fun `desired outcomes, once set, can not be reset back to null or empty`() {
    val updateWithServiceCategory = DraftReferralDTO(
      desiredOutcomesIds = mutableListOf(
        UUID.fromString("301ead30-30a4-4c7c-8296-2768abfb59b5"),
        UUID.fromString("9b30ffad-dfcb-44ce-bdca-0ea49239a21a")
      ),
      serviceCategoryId = UUID.fromString("428ee70f-3001-4399-95a6-ad25eaaede16")
    )
    sampleReferral = referralService.updateDraftReferral(sampleReferral, updateWithServiceCategory)
    assertThat(sampleReferral.desiredOutcomesIDs).size().isEqualTo(2)

    var error = assertThrows<ValidationError> {
      // this throws ValidationError
      referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(desiredOutcomesIds = mutableListOf()))
    }
    assertThat(error.errors.size).isEqualTo(1)
    assertThat(error.errors[0].field).isEqualTo("desiredOutcomesIds")

    // update with null is ignored
    referralService.updateDraftReferral(sampleReferral, DraftReferralDTO(desiredOutcomesIds = null))

    // Ensure no changes
    sampleReferral = referralService.getDraftReferral(sampleReferral.id!!)!!
    assertThat(sampleReferral.desiredOutcomesIDs).size().isEqualTo(2)
  }

  @Test
  fun `multiple errors at once`() {
    val update = DraftReferralDTO(completionDeadline = LocalDate.of(2020, 1, 1), needsInterpreter = true)
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(sampleReferral, update)
    }
    assertThat(error.errors.size).isEqualTo(2)
  }

  @Test
  fun `the referral isn't actually updated if any of the fields contain validation errors`() {
    // any invalid fields should mean that no fields are written to the db
    val update = DraftReferralDTO(
      // valid field
      additionalNeedsInformation = "requires wheelchair access",
      // invalid field
      completionDeadline = LocalDate.of(2020, 1, 1),
    )
    val error = assertThrows<ValidationError> {
      referralService.updateDraftReferral(sampleReferral, update)
    }

    entityManager.flush()
    assertThat(referralService.getDraftReferral(sampleReferral.id!!)!!.additionalNeedsInformation).isNull()
  }

  @Test
  fun `once a draft referral is sent it's id is no longer is a valid draft referral`() {
    val user = AuthUser("user_id", "auth_source", "user_name")
    val draftReferral = referralService.createDraftReferral(user, "X123456", sampleIntervention.id!!)

    assertThat(referralService.getDraftReferral(draftReferral.id!!)).isNotNull()

    val sentReferral = referralService.sendDraftReferral(draftReferral, user)

    assertThat(referralService.getDraftReferral(draftReferral.id!!)).isNull()
    assertThat(referralService.getSentReferral(sentReferral.id!!)).isNotNull()
  }

  @Test
  fun `sending a draft referral triggers an event`() {
    val user = AuthUser("user_id", "auth_source", "user_name")
    val draftReferral = referralService.createDraftReferral(user, "X123456", sampleIntervention.id!!)
    referralService.sendDraftReferral(draftReferral, user)
    verify(referralEventPublisher).referralSentEvent(draftReferral)
  }

  @Test
  fun `multiple draft referrals can be started by the same user`() {
    for (i in 1..3) {
      val user = AuthUser("multi_user_id", "auth_source", "user_name")
      assertDoesNotThrow { referralService.createDraftReferral(user, "X123456", sampleIntervention.id!!) }
    }
    assertThat(referralService.getDraftReferralsCreatedByUserID("multi_user_id")).hasSize(3)
  }

  @Test
  fun `get all sent referrals returns referrals for multiple service providers`() {
    listOf("PROVIDER1", "PROVIDER2").forEach {
      SampleData.persistReferral(
        entityManager,
        SampleData.sampleReferral(
          "X123456",
          it,
          sentAt = OffsetDateTime.now(),
          sentBy = AuthUser("123456", "user_id", "user_name"),
          referenceNumber = "REF123"
        )
      )
    }

    assertThat(referralService.getAllSentReferrals().size).isEqualTo(2)
  }

  @Test
  fun `get sent referrals by provider id returns filtered referrals`() {
    listOf("PROVIDER1", "PROVIDER2").forEach {
      SampleData.persistReferral(
        entityManager,
        SampleData.sampleReferral(
          "X123456",
          it,
          sentAt = OffsetDateTime.now(),
          sentBy = AuthUser("123456", "user_id", "user_name"),
          referenceNumber = "REF123"
        )
      )
    }

    assertThat(referralService.getSentReferralsForServiceProviderID("PROVIDER2").size).isEqualTo(1)
    assertThat(referralService.getSentReferralsForServiceProviderID("PROVIDER3").size).isEqualTo(0)
  }
}
