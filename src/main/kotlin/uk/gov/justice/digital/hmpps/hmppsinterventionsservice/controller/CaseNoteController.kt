package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateCaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CaseNoteService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService

@RestController
class CaseNoteController(
  val userMapper: UserMapper,
  val caseNoteService: CaseNoteService,
  val referralService: ReferralService,
) {
  @PostMapping("/case-note")
  fun createCaseNote(
    @RequestBody createCaseNote: CreateCaseNoteDTO,
    authentication: JwtAuthenticationToken
  ): CaseNoteDTO {
    val user = userMapper.fromToken(authentication)
    val sentReferral = referralService.getSentReferralForUser(createCaseNote.referralId, user) ?: throw ResponseStatusException(
      HttpStatus.BAD_REQUEST, "sent referral not found [id=${createCaseNote.referralId}]"
    )
    val caseNote = caseNoteService.createCaseNote(
      referralId = sentReferral.id,
      subject = createCaseNote.subject,
      body = createCaseNote.body,
      sentByUser = user
    )
    return CaseNoteDTO.from(caseNote)
  }
}
