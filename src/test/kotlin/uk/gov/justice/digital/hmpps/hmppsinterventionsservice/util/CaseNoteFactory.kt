package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CaseNote
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

class CaseNoteFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val authUserFactory = AuthUserFactory(em)
  private val referralFactory = ReferralFactory(em)

  fun create(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    subject: String,
    body: String,
    sentAt: OffsetDateTime = OffsetDateTime.now(),
    sentBy: AuthUser = authUserFactory.create(),
  ): CaseNote {
    return save(
      CaseNote(
        id = id,
        referral = referral,
        subject = subject,
        body = body,
        sentAt = sentAt,
        sentBy = sentBy,
      )
    )
  }
}
