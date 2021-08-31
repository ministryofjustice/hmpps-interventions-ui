package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpStatus
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateCaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CaseNoteService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import java.util.UUID

@RestController
class CaseNoteController(
  val userMapper: UserMapper,
  val caseNoteService: CaseNoteService,
  val referralService: ReferralService
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

  @GetMapping("/sent-referral/{referralId}/case-notes")
  fun getCaseNotes(
    @PageableDefault(page = 0, size = 10, sort = ["sentAt"]) pageable: Pageable,
    @PathVariable referralId: UUID,
    authentication: JwtAuthenticationToken
  ): Page<CaseNoteDTO> {
    val user = userMapper.fromToken(authentication)
    val sentReferral = referralService.getSentReferralForUser(referralId, user) ?: throw ResponseStatusException(
      HttpStatus.NOT_FOUND, "sent referral not found [id=$referralId]"
    )
    return caseNoteService.findByReferral(sentReferral.id, pageable).map { caseNote -> CaseNoteDTO.from(caseNote) }
  }
}
