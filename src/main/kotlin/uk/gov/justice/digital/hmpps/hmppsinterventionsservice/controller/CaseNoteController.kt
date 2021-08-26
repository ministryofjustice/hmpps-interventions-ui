package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.CreateCaseNoteDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.CaseNoteService

@RestController
class CaseNoteController(
  val userMapper: UserMapper,
  val caseNoteService: CaseNoteService,
) {
  @PostMapping("/case-note")
  fun createCaseNote(
    @RequestBody createCaseNote: CreateCaseNoteDTO,
    authentication: JwtAuthenticationToken
  ): CaseNoteDTO {

    val caseNote = caseNoteService.createCaseNote(
      createCaseNote.referralId,
      createCaseNote.subject,
      createCaseNote.body,
      userMapper.fromToken(authentication)
    )

    return CaseNoteDTO.from(caseNote)
  }
}
