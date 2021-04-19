package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID

class ReferralFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val authUserFactory = AuthUserFactory(em)
  private val interventionFactory = InterventionFactory(em)
  private val calcellationReasonFactory = CancellationReasonFactory(em)

  fun createDraft(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    serviceUserCRN: String = "X123456",
    intervention: Intervention = interventionFactory.create(),
    completionDeadline: LocalDate? = null,
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    serviceUserData: ServiceUserData? = null,
  ): Referral {
    return create(
      id = id,
      createdAt = createdAt,
      createdBy = createdBy,
      serviceUserCRN = serviceUserCRN,
      intervention = intervention,
      completionDeadline = completionDeadline,
      desiredOutcomes = desiredOutcomes,
      serviceUserData = serviceUserData,
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

  fun createEnded(
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
    endedAt: OffsetDateTime? = OffsetDateTime.now(),
    endedBy: AuthUser? = authUserFactory.create(),
    cancellationReason: CancellationReason? = calcellationReasonFactory.create()
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

      endedAt = endedAt,
      endedBy = endedBy,
      cancellationReason = cancellationReason
    )
  }

  private fun create(
    id: UUID,
    createdAt: OffsetDateTime,
    createdBy: AuthUser,
    serviceUserCRN: String,
    intervention: Intervention,

    completionDeadline: LocalDate? = null,
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    serviceUserData: ServiceUserData? = null,

    sentAt: OffsetDateTime? = null,
    sentBy: AuthUser? = null,
    referenceNumber: String? = null,

    assignedAt: OffsetDateTime? = null,
    assignedBy: AuthUser? = null,
    assignedTo: AuthUser? = null,
    endedAt: OffsetDateTime? = null,
    endedBy: AuthUser? = null,
    cancellationReason: CancellationReason? = null,
  ): Referral {
    return save(
      Referral(
        id = id,
        createdAt = createdAt,
        createdBy = createdBy,
        serviceUserCRN = serviceUserCRN,
        intervention = intervention,
        completionDeadline = completionDeadline,
        desiredOutcomesIDs = desiredOutcomes.map { it.id },
        serviceUserData = serviceUserData,
        sentAt = sentAt,
        sentBy = sentBy,
        referenceNumber = referenceNumber,
        assignedAt = assignedAt,
        assignedBy = assignedBy,
        assignedTo = assignedTo,
        endedAt = endedAt,
        endedBy = endedBy,
        cancellationReason = cancellationReason,
      )
    )
  }
}
