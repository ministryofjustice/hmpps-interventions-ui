package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateCaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CaseNoteService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.CaseNoteFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory

class CaseNoteControllerTest {
  private val caseNoteFactory = CaseNoteFactory()
  private val tokenFactory = JwtTokenFactory()
  private val authUserFactory = AuthUserFactory()
  private val authUserRepository = mock<AuthUserRepository>()
  private val userMapper = UserMapper(authUserRepository)
  private val caseNoteService = mock<CaseNoteService>()
  private val caseNoteController = CaseNoteController(userMapper, caseNoteService)

  @Nested
  inner class AddNewCaseNote {
    @Test
    fun `can add new case note to referral`() {
      val user = authUserFactory.create()
      val userToken = tokenFactory.create(user)
      val caseNote = caseNoteFactory.create(subject = "subject", body = "body")
      val createCaseNoteDTO = CreateCaseNoteDTO(referralId = caseNote.referral.id, subject = "subject", body = "body")

      whenever(caseNoteService.createCaseNote(referralId = caseNote.referral.id, subject = "subject", body = "body", sentByUser = user)).thenReturn(caseNote)

      val caseNoteDTO = caseNoteController.createCaseNote(createCaseNoteDTO, userToken)
      assertThat(caseNoteDTO).isEqualTo(CaseNoteDTO.from(caseNote))
    }
  }
}
