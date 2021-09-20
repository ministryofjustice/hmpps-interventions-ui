package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.CaseNoteEventPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CaseNote
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.CaseNoteRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import java.time.OffsetDateTime
import java.util.UUID
import javax.transaction.Transactional

@Service
@Transactional
class CaseNoteService(
  val caseNoteRepository: CaseNoteRepository,
  val referralRepository: ReferralRepository,
  val referralService: ReferralService,
  val authUserRepository: AuthUserRepository,
  val caseNoteEventPublisher: CaseNoteEventPublisher,
) {

  fun createCaseNote(referralId: UUID, subject: String, body: String, sentByUser: AuthUser): CaseNote {
    val caseNote = CaseNote(
      id = UUID.randomUUID(),
      referral = referralRepository.getById(referralId),
      subject = subject,
      body = body,
      sentBy = authUserRepository.save(sentByUser),
      sentAt = OffsetDateTime.now(),
    )
    return caseNoteRepository.save(caseNote).also {
      caseNoteEventPublisher.caseNoteSentEvent(it)
    }
  }

  fun findByReferral(referralId: UUID, pageable: Pageable?): Page<CaseNote> {
    return caseNoteRepository.findAllByReferralId(referralId, pageable)
  }

  fun getCaseNoteForUser(id: UUID, user: AuthUser): CaseNote? {
    val caseNote = caseNoteRepository.findByIdOrNull(id)

    // validate that the user has access to the associated referral
    caseNote?.let {
      referralService.getSentReferralForUser(it.id, user)
    }

    return caseNote
  }
}
