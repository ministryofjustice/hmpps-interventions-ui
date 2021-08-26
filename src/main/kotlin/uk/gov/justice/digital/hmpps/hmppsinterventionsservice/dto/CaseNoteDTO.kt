package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto

import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CaseNote
import java.time.OffsetDateTime
import java.util.UUID

data class CaseNoteDTO(
  val id: UUID,
  val referralId: UUID,
  val subject: String,
  val body: String,
  val sentBy: AuthUserDTO,
  val sentAt: OffsetDateTime,
) {
  companion object {
    fun from(caseNote: CaseNote): CaseNoteDTO {
      return CaseNoteDTO(id = caseNote.id, referralId = caseNote.referral.id, subject = caseNote.subject, body = caseNote.body, sentAt = caseNote.sentAt, sentBy = AuthUserDTO.from(caseNote.sentBy))
    }
  }
}

data class CreateCaseNoteDTO(
  val referralId: UUID,
  val subject: String,
  val body: String,
)
