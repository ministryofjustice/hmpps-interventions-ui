package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CaseNoteRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.CaseNoteFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.RepositoryTest

@RepositoryTest
class CaseNoteServiceTest @Autowired constructor(
  val entityManager: TestEntityManager,
  val caseNoteRepository: CaseNoteRepository,
  val referralRepository: ReferralRepository,
  val authUserRepository: AuthUserRepository,
) {
  private val userFactory = AuthUserFactory(entityManager)
  private val caseNoteService = CaseNoteService(caseNoteRepository, referralRepository, authUserRepository)
  private val caseNoteFactory = CaseNoteFactory(entityManager)
  private val referralFactory = ReferralFactory(entityManager)

  @Nested
  inner class CreateCaseNote {
    @Test
    fun `can create case note`() {
      val referral = referralFactory.createSent()
      val user = userFactory.create()
      val caseNote = caseNoteService.createCaseNote(referral.id, subject = "subject", body = "body", user)
      val savedCaseNote = caseNoteRepository.findById(caseNote.id).get()
      assertThat(caseNote).isEqualTo(savedCaseNote)
      assertThat(caseNote.referral.id).isEqualTo(referral.id)
      assertThat(caseNote.subject).isEqualTo("subject")
      assertThat(caseNote.body).isEqualTo("body")
      assertThat(caseNote.sentAt).isNotNull()
      assertThat(caseNote.sentBy).isEqualTo(user)
    }
  }
}
