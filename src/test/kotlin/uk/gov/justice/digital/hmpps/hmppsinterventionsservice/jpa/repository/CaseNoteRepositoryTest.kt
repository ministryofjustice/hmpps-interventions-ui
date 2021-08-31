package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CaseNote
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class CaseNoteRepositoryTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val caseNoteRepository: CaseNoteRepository,
) {
  private val authUserFactory = AuthUserFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)
  @Test
  fun `can retrieve a case note`() {
    val caseNote = buildAndPersistCaseNote()
    val savedCaseNote = caseNoteRepository.findById(caseNote.id)
    Assertions.assertThat(savedCaseNote.get().subject).isEqualTo(caseNote.subject)
    Assertions.assertThat(savedCaseNote.get().body).isEqualTo(caseNote.body)
    Assertions.assertThat(savedCaseNote.get().sentAt).isEqualTo(caseNote.sentAt)
    Assertions.assertThat(savedCaseNote.get().sentBy).isEqualTo(caseNote.sentBy)
    Assertions.assertThat(savedCaseNote.get().referral.id).isEqualTo(caseNote.referral.id)
  }

  private fun buildAndPersistCaseNote(): CaseNote {
    val user = authUserFactory.create(id = "referral_repository_test_user_id")
    val referral = referralFactory.createSent()

    val caseNote = SampleData.sampleCaseNote(referral = referral, sentBy = user)
    caseNoteRepository.save(caseNote)
    entityManager.flush()

    return caseNote
  }
}
