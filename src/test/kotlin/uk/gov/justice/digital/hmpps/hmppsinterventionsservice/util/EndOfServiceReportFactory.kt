package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReportOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

class EndOfServiceReportFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val authUserFactory = AuthUserFactory(em)
  private val referralFactory = ReferralFactory(em)

  fun create(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    submittedAt: OffsetDateTime? = null,
    submittedBy: AuthUser? = null,
    furtherInformation: String? = null,
    outcomes: MutableSet<EndOfServiceReportOutcome> = mutableSetOf(),
  ): EndOfServiceReport {
    return save(
      EndOfServiceReport(
        id = id,
        referral = referral,
        createdAt = createdAt,
        createdBy = createdBy,
        submittedAt = submittedAt,
        submittedBy = submittedBy,
        furtherInformation = furtherInformation,
        outcomes = outcomes,
      )
    )
  }
}
