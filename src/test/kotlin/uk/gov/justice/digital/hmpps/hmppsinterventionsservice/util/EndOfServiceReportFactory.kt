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
  private val endOfServiceReportOutcomeFactory = EndOfServiceReportOutcomeFactory(em)

  fun create(
    id: UUID? = null,
    referral: Referral = referralFactory.createSent(),
    createdAt: OffsetDateTime? = null,
    createdBy: AuthUser? = null,
    submittedAt: OffsetDateTime? = null,
    submittedBy: AuthUser? = null,
    furtherInformation: String? = null,
    outcomes: Set<EndOfServiceReportOutcome>? = null,
  ): EndOfServiceReport {
    return save(
      EndOfServiceReport(
        id = id ?: UUID.randomUUID(),
        referral = referral,
        createdAt = createdAt ?: OffsetDateTime.now(),
        createdBy = createdBy ?: authUserFactory.create(),
        submittedAt = submittedAt ?: OffsetDateTime.now(),
        submittedBy = submittedBy ?: authUserFactory.create(),
        furtherInformation = furtherInformation,
        outcomes = outcomes?.toMutableSet() ?: mutableSetOf(endOfServiceReportOutcomeFactory.create())
      )
    )
  }
}
