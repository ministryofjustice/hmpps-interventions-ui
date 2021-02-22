package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

class ReferralFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val authUserFactory = AuthUserFactory(em)
  private val interventionFactory = InterventionFactory(em)

  fun create(
    id: UUID? = null,
    createdAt: OffsetDateTime? = null,
    createdBy: AuthUser? = null,
    serviceUserCRN: String = "X123456",
    intervention: Intervention? = null,

    completionDeadline: LocalDate? = null,

    sentAt: OffsetDateTime? = null,
    sentBy: AuthUser? = null,
    referenceNumber: String? = null,
  ): Referral {
    return save(
      Referral(
        id = id ?: UUID.randomUUID(),
        createdAt = createdAt ?: OffsetDateTime.now(),
        createdBy = createdBy ?: authUserFactory.create(),
        serviceUserCRN = serviceUserCRN,
        intervention = intervention ?: interventionFactory.create(),
        completionDeadline = completionDeadline,
        sentAt = sentAt,
        sentBy = sentBy,
        referenceNumber = referenceNumber,
      )
    )
  }
}
