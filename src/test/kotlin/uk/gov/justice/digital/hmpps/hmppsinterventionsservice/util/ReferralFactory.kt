package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
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
  private val cancellationReasonFactory = CancellationReasonFactory(em)

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
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    actionPlan: ActionPlan? = null,

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
      desiredOutcomes = desiredOutcomes,
      actionPlan = actionPlan,

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

    endRequestedAt: OffsetDateTime? = OffsetDateTime.now(),
    endRequestedBy: AuthUser? = authUserFactory.create(),
    endRequestedReason: CancellationReason? = cancellationReasonFactory.create(),
    endRequestedComments: String? = null,

    concludedAt: OffsetDateTime? = null,
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

      endRequestedAt = endRequestedAt,
      endRequestedBy = endRequestedBy,
      endRequestedReason = endRequestedReason,
      endRequestedComments = endRequestedComments,

      concludedAt = concludedAt,
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
    actionPlan: ActionPlan? = null,

    sentAt: OffsetDateTime? = null,
    sentBy: AuthUser? = null,
    referenceNumber: String? = null,

    assignedAt: OffsetDateTime? = null,
    assignedBy: AuthUser? = null,
    assignedTo: AuthUser? = null,

    endRequestedAt: OffsetDateTime? = null,
    endRequestedBy: AuthUser? = null,
    endRequestedReason: CancellationReason? = null,
    endRequestedComments: String? = null,

    concludedAt: OffsetDateTime? = null,
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
        actionPlan = actionPlan,
        sentAt = sentAt,
        sentBy = sentBy,
        referenceNumber = referenceNumber,
        assignedAt = assignedAt,
        assignedBy = assignedBy,
        assignedTo = assignedTo,
        endRequestedAt = endRequestedAt,
        endRequestedBy = endRequestedBy,
        endRequestedReason = endRequestedReason,
        endRequestedComments = endRequestedComments,
        concludedAt = concludedAt,
      )
    )
  }
}
