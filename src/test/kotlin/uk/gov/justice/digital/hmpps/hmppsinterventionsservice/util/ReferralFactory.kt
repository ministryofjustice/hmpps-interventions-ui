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

  fun createDraft(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    serviceUserCRN: String = "X123456",
    intervention: Intervention = interventionFactory.create(),

    completionDeadline: LocalDate? = null,
  ): Referral {
    return create(
      id = id,
      createdAt = createdAt,
      createdBy = createdBy,
      serviceUserCRN = serviceUserCRN,
      intervention = intervention,
      completionDeadline = completionDeadline,
    )
  }

  fun createSent(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    serviceUserCRN: String = "X123456",
    intervention: Intervention = interventionFactory.create(),

    sentAt: OffsetDateTime = OffsetDateTime.now(),
    sentBy: AuthUser = authUserFactory.create(),
    referenceNumber: String? = "JS18726AC",

    assignedBy: AuthUser? = null,
    assignedTo: AuthUser? = null,
    assignedAt: OffsetDateTime? = null,
  ): Referral {
    return create(
      id = id,
      createdAt = createdAt,
      createdBy = createdBy,
      serviceUserCRN = serviceUserCRN,
      intervention = intervention,

      sentAt = sentAt,
      sentBy = sentBy,
      referenceNumber = referenceNumber,

      assignedBy = assignedBy,
      assignedTo = assignedTo,
      assignedAt = assignedAt,
    )
  }

  private fun create(
    id: UUID,
    createdAt: OffsetDateTime,
    createdBy: AuthUser,
    serviceUserCRN: String,
    intervention: Intervention,

    completionDeadline: LocalDate? = null,

    sentAt: OffsetDateTime? = null,
    sentBy: AuthUser? = null,
    referenceNumber: String? = null,

    assignedAt: OffsetDateTime? = null,
    assignedBy: AuthUser? = null,
    assignedTo: AuthUser? = null,
  ): Referral {
    return save(
      Referral(
        id = id,
        createdAt = createdAt,
        createdBy = createdBy,
        serviceUserCRN = serviceUserCRN,
        intervention = intervention,
        completionDeadline = completionDeadline,
        sentAt = sentAt,
        sentBy = sentBy,
        referenceNumber = referenceNumber,
        assignedAt = assignedAt,
        assignedBy = assignedBy,
        assignedTo = assignedTo,
      )
    )
  }
}
