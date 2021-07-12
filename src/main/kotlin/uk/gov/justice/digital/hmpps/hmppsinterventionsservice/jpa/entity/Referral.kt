package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import org.hibernate.annotations.FetchMode.JOIN
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.CollectionTable
import javax.persistence.Column
import javax.persistence.ElementCollection
import javax.persistence.Embeddable
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.Index
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToMany
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.PrimaryKeyJoinColumn
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Embeddable
class SelectedDesiredOutcomesMapping(
  @Column(name = "service_category_id")
  var serviceCategoryId: UUID,
  @Column(name = "desired_outcome_id")
  var desiredOutcomeId: UUID
)

@Entity
@Table(indexes = arrayOf(Index(columnList = "created_by_id")))
class Referral(
  @ElementCollection val assignments: MutableList<ReferralAssignment> = mutableListOf(),

  // sent referral fields
  var sentAt: OffsetDateTime? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var sentBy: AuthUser? = null,
  var referenceNumber: String? = null,
  var supplementaryRiskId: UUID? = null,

  var endRequestedAt: OffsetDateTime? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var endRequestedBy: AuthUser? = null,
  @ManyToOne @JoinColumn(name = "end_requested_reason_code") var endRequestedReason: CancellationReason? = null,
  var endRequestedComments: String? = null,
  var concludedAt: OffsetDateTime? = null,

  // draft referral fields
  @OneToOne(mappedBy = "referral", cascade = arrayOf(CascadeType.ALL)) @PrimaryKeyJoinColumn var serviceUserData: ServiceUserData? = null,
  @Column(name = "draft_supplementary_risk") var additionalRiskInformation: String? = null,
  @Column(name = "draft_supplementary_risk_updated_at") var additionalRiskInformationUpdatedAt: OffsetDateTime? = null,
  var furtherInformation: String? = null,
  var additionalNeedsInformation: String? = null,
  var accessibilityNeeds: String? = null,
  var needsInterpreter: Boolean? = null,
  var interpreterLanguage: String? = null,
  var hasAdditionalResponsibilities: Boolean? = null,
  var whenUnavailable: String? = null,
  var maximumEnforceableDays: Int? = null,
  @ElementCollection
  @CollectionTable(name = "referral_desired_outcome", joinColumns = [JoinColumn(name = "referral_id")])
  var selectedDesiredOutcomes: MutableList<SelectedDesiredOutcomesMapping>? = null,
  var completionDeadline: LocalDate? = null,

  var relevantSentenceId: Long? = null,

  @OneToMany(fetch = FetchType.LAZY) @JoinColumn(name = "referral_id") var actionPlans: MutableList<ActionPlan>? = null,

  @ManyToMany(fetch = FetchType.LAZY)
  @JoinTable(
    name = "referral_selected_service_category",
    joinColumns = [JoinColumn(name = "referral_id")],
    inverseJoinColumns = [JoinColumn(name = "service_category_id")]
  )
  var selectedServiceCategories: MutableSet<ServiceCategory>? = null,

  @ElementCollection var complexityLevelIds: MutableMap<UUID, UUID>? = null,

  // required fields
  @NotNull @ManyToOne(fetch = FetchType.LAZY) val intervention: Intervention,
  @NotNull val serviceUserCRN: String,
  @NotNull @ManyToOne @Fetch(FetchMode.JOIN) val createdBy: AuthUser,
  @NotNull val createdAt: OffsetDateTime,
  @Id val id: UUID,

  @OneToOne(mappedBy = "referral") @Fetch(JOIN) var endOfServiceReport: EndOfServiceReport? = null,
  @OneToOne(mappedBy = "referral") @Fetch(JOIN) var supplierAssessment: SupplierAssessment? = null,
) {
  fun getResponsibleProbationPractitioner(): AuthUser {
    // fixme: should this sentBy or createdBy?
    return createdBy
  }

  fun cancelled(): Boolean = concludedAt != null && endRequestedAt != null && endOfServiceReport == null

  val currentActionPlan: ActionPlan?
    get() = actionPlans?.maxByOrNull { it.createdAt }

  val currentAssignment: ReferralAssignment?
    get() = assignments.maxByOrNull { it.assignedAt }

  val currentAssignee: AuthUser?
    get() = currentAssignment?.assignedTo
}
