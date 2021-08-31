package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateCaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CaseNoteService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.CaseNoteFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory

class CaseNoteControllerTest {
  private val caseNoteFactory = CaseNoteFactory()
  private val tokenFactory = JwtTokenFactory()
  private val authUserFactory = AuthUserFactory()
  private val referralFactory = ReferralFactory()
  private val authUserRepository = mock<AuthUserRepository>()
  private val userMapper = UserMapper(authUserRepository)
  private val caseNoteService = mock<CaseNoteService>()
  private val referralService = mock<ReferralService>()
  private val caseNoteController = CaseNoteController(userMapper, caseNoteService, referralService)

  @Nested
  inner class AddNewCaseNote {
    @Test
    fun `can add new case note to referral`() {
      val user = authUserFactory.create()
      val userToken = tokenFactory.create(user)
      val caseNote = caseNoteFactory.create(subject = "subject", body = "body")
      val referralId = caseNote.referral.id
      val createCaseNoteDTO = CreateCaseNoteDTO(referralId = referralId, subject = "subject", body = "body")

      whenever(referralService.getSentReferralForUser(id = referralId, user = user)).thenReturn(referralFactory.createSent(id = referralId))
      whenever(caseNoteService.createCaseNote(referralId = referralId, subject = "subject", body = "body", sentByUser = user)).thenReturn(caseNote)

      val caseNoteDTO = caseNoteController.createCaseNote(createCaseNoteDTO, userToken)
      assertThat(caseNoteDTO).isEqualTo(CaseNoteDTO.from(caseNote))
    }
    @Test
    fun `returns bad request when sent referral does not exist`() {
      val user = authUserFactory.create()
      val userToken = tokenFactory.create(user)
      val caseNote = caseNoteFactory.create(subject = "subject", body = "body")
      val referralId = caseNote.referral.id
      val createCaseNoteDTO = CreateCaseNoteDTO(referralId = referralId, subject = "subject", body = "body")
      whenever(referralService.getSentReferralForUser(id = referralId, user = user)).thenReturn(null)
      val e = assertThrows<ResponseStatusException> {
        caseNoteController.createCaseNote(createCaseNoteDTO, userToken)
      }
      assertThat(e.status).isEqualTo(HttpStatus.BAD_REQUEST)
      assertThat(e.message).contains("sent referral not found")
    }
  }
}
