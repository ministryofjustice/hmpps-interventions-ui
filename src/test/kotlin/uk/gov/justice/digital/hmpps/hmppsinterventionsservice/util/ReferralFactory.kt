package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CancellationReason
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.DesiredOutcome
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Intervention
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SelectedDesiredOutcomesMapping
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceCategory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceUserData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SupplierAssessment
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
    selectedServiceCategories: MutableSet<ServiceCategory>? = null,
    completionDeadline: LocalDate? = null,
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    serviceUserData: ServiceUserData? = null,
    complexityLevelIds: MutableMap<UUID, UUID>? = null,
    additionalRiskInformation: String? = null,
    additionalRiskInformationUpdatedAt: OffsetDateTime? = null,
  ): Referral {
    return create(
      id = id,
      createdAt = createdAt,
      createdBy = createdBy,
      serviceUserCRN = serviceUserCRN,
      intervention = intervention,
      selectedServiceCategories = selectedServiceCategories,
      completionDeadline = completionDeadline,
      desiredOutcomes = desiredOutcomes,
      serviceUserData = serviceUserData,
      complexityLevelIds = complexityLevelIds,
      additionalRiskInformation = additionalRiskInformation,
      additionalRiskInformationUpdatedAt = additionalRiskInformationUpdatedAt,
    )
  }

  fun createSent(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    serviceUserCRN: String = "X123456",
    relevantSentenceId: Long = 1234567L,
    intervention: Intervention = interventionFactory.create(),
    selectedServiceCategories: MutableSet<ServiceCategory>? = null,
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    actionPlans: MutableList<ActionPlan>? = null,

    sentAt: OffsetDateTime = OffsetDateTime.now(),
    sentBy: AuthUser = authUserFactory.create(),
    referenceNumber: String? = "JS18726AC",
    supplementaryRiskId: UUID = UUID.randomUUID(),

    assignments: List<ReferralAssignment> = emptyList(),

    supplierAssessment: SupplierAssessment? = null,
  ): Referral {
    val referral = create(
      id = id,
      createdAt = createdAt,
      createdBy = createdBy,
      serviceUserCRN = serviceUserCRN,
      relevantSentenceId = relevantSentenceId,
      intervention = intervention,
      selectedServiceCategories = selectedServiceCategories,
      desiredOutcomes = desiredOutcomes,
      actionPlans = actionPlans,

      sentAt = sentAt,
      sentBy = sentBy,
      referenceNumber = referenceNumber,
      supplementaryRiskId = supplementaryRiskId,

      assignments = assignments,
      supplierAssessment = supplierAssessment
    )
    return referral
  }

  fun createAssigned(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    serviceUserCRN: String = "X123456",
    relevantSentenceId: Long = 1234567L,
    intervention: Intervention = interventionFactory.create(),
    selectedServiceCategories: MutableSet<ServiceCategory>? = null,
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    actionPlans: MutableList<ActionPlan>? = null,

    sentAt: OffsetDateTime = OffsetDateTime.now(),
    sentBy: AuthUser = authUserFactory.create(),
    referenceNumber: String? = "JS18726AC",
    supplementaryRiskId: UUID = UUID.randomUUID(),

    assignments: List<ReferralAssignment> = listOf(
      ReferralAssignment(OffsetDateTime.now(), authUserFactory.createSP(), authUserFactory.createSP())
    ),

    supplierAssessment: SupplierAssessment? = null,
  ): Referral {
    val referral = create(
      id = id,
      createdAt = createdAt,
      createdBy = createdBy,
      serviceUserCRN = serviceUserCRN,
      relevantSentenceId = relevantSentenceId,
      intervention = intervention,
      selectedServiceCategories = selectedServiceCategories,
      desiredOutcomes = desiredOutcomes,
      actionPlans = actionPlans,

      sentAt = sentAt,
      sentBy = sentBy,
      referenceNumber = referenceNumber,
      supplementaryRiskId = supplementaryRiskId,

      assignments = assignments,
      supplierAssessment = supplierAssessment
    )
    return referral
  }

  fun createEnded(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    serviceUserCRN: String = "X123456",
    intervention: Intervention = interventionFactory.create(),
    selectedServiceCategories: MutableSet<ServiceCategory>? = null,
    sentAt: OffsetDateTime = OffsetDateTime.now(),
    sentBy: AuthUser = authUserFactory.create(),
    referenceNumber: String? = "JS18726AC",
    relevantSentenceId: Long? = 123456L,
    supplementaryRiskId: UUID = UUID.randomUUID(),
    actionPlans: MutableList<ActionPlan>? = null,

    assignments: List<ReferralAssignment> = emptyList(),

    endRequestedAt: OffsetDateTime? = OffsetDateTime.now(),
    endRequestedBy: AuthUser? = authUserFactory.create(),
    endRequestedReason: CancellationReason? = cancellationReasonFactory.create(),
    endRequestedComments: String? = null,

    concludedAt: OffsetDateTime? = null,

    endOfServiceReport: EndOfServiceReport? = null,
  ): Referral {
    return create(
      id = id,
      createdAt = createdAt,
      createdBy = createdBy,
      serviceUserCRN = serviceUserCRN,
      intervention = intervention,
      selectedServiceCategories = selectedServiceCategories,
      actionPlans = actionPlans,

      sentAt = sentAt,
      sentBy = sentBy,
      referenceNumber = referenceNumber,
      supplementaryRiskId = supplementaryRiskId,
      relevantSentenceId = relevantSentenceId,

      assignments = assignments,

      endRequestedAt = endRequestedAt,
      endRequestedBy = endRequestedBy,
      endRequestedReason = endRequestedReason,
      endRequestedComments = endRequestedComments,

      concludedAt = concludedAt,

      endOfServiceReport = endOfServiceReport,
    )
  }

  private fun create(
    id: UUID,
    createdAt: OffsetDateTime,
    createdBy: AuthUser,
    serviceUserCRN: String,
    intervention: Intervention,
    relevantSentenceId: Long? = null,

    completionDeadline: LocalDate? = null,
    desiredOutcomes: List<DesiredOutcome> = emptyList(),
    serviceUserData: ServiceUserData? = null,
    actionPlans: MutableList<ActionPlan>? = null,
    selectedServiceCategories: MutableSet<ServiceCategory>? = null,
    complexityLevelIds: MutableMap<UUID, UUID>? = null,
    additionalRiskInformation: String? = null,
    additionalRiskInformationUpdatedAt: OffsetDateTime? = null,

    sentAt: OffsetDateTime? = null,
    sentBy: AuthUser? = null,
    referenceNumber: String? = null,
    supplementaryRiskId: UUID? = null,

    assignments: List<ReferralAssignment> = emptyList(),

    endRequestedAt: OffsetDateTime? = null,
    endRequestedBy: AuthUser? = null,
    endRequestedReason: CancellationReason? = null,
    endRequestedComments: String? = null,

    concludedAt: OffsetDateTime? = null,
    supplierAssessment: SupplierAssessment? = null,
    endOfServiceReport: EndOfServiceReport? = null,
  ): Referral {
    val referral = save(
      Referral(
        id = id,
        createdAt = createdAt,
        createdBy = createdBy,
        serviceUserCRN = serviceUserCRN,
        intervention = intervention,
        relevantSentenceId = relevantSentenceId,
        completionDeadline = completionDeadline,
        serviceUserData = serviceUserData,
        actionPlans = actionPlans,
        selectedServiceCategories = selectedServiceCategories,
        complexityLevelIds = complexityLevelIds,
        additionalRiskInformation = additionalRiskInformation,
        additionalRiskInformationUpdatedAt = additionalRiskInformationUpdatedAt,
        sentAt = sentAt,
        sentBy = sentBy,
        referenceNumber = referenceNumber,
        supplementaryRiskId = supplementaryRiskId,
        assignments = assignments.toMutableList(),
        endRequestedAt = endRequestedAt,
        endRequestedBy = endRequestedBy,
        endRequestedReason = endRequestedReason,
        endRequestedComments = endRequestedComments,
        concludedAt = concludedAt,
        endOfServiceReport = endOfServiceReport,
        supplierAssessment = supplierAssessment,
      )
    )
    referral.selectedDesiredOutcomes = desiredOutcomes.map { SelectedDesiredOutcomesMapping(it.serviceCategoryId, it.id) }.toMutableList()
    save(referral)
    return referral
  }
}
