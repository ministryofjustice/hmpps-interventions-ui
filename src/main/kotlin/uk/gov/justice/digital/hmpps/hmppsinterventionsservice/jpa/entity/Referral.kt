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
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.Index
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToOne
import javax.persistence.PrimaryKeyJoinColumn
import javax.persistence.Table
import javax.persistence.UniqueConstraint
import javax.validation.constraints.NotNull

@Entity
@Table(indexes = arrayOf(Index(columnList = "created_by_id")))
class Referral(
  // assigned referral fields
  var assignedAt: OffsetDateTime? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var assignedBy: AuthUser? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var assignedTo: AuthUser? = null,

  // sent referral fields
  var sentAt: OffsetDateTime? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var sentBy: AuthUser? = null,
  var referenceNumber: String? = null,

  // ended referral fields
  var endedAt: OffsetDateTime? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var endedBy: AuthUser? = null,

  @ManyToOne @JoinColumn(name = "cancellation_reason_code")
  var cancellationReason: CancellationReason? = null,
  var cancellationComments: String? = null,

  // draft referral fields
  @OneToOne(mappedBy = "referral", cascade = arrayOf(CascadeType.ALL)) @PrimaryKeyJoinColumn var serviceUserData: ServiceUserData? = null,
  var additionalRiskInformation: String? = null,
  var furtherInformation: String? = null,
  var additionalNeedsInformation: String? = null,
  var accessibilityNeeds: String? = null,
  var needsInterpreter: Boolean? = null,
  var interpreterLanguage: String? = null,
  var hasAdditionalResponsibilities: Boolean? = null,
  var whenUnavailable: String? = null,
  var complexityLevelID: UUID? = null,
  var usingRarDays: Boolean? = null,
  var maximumRarDays: Int? = null,
  @ElementCollection
  @CollectionTable(
    name = "referral_desired_outcome",
    uniqueConstraints = [UniqueConstraint(columnNames = arrayOf("referral_id", "desired_outcome_id"))]
  )
  @Column(name = "desired_outcome_id")
  var desiredOutcomesIDs: List<UUID>? = null,
  var completionDeadline: LocalDate? = null,

  var relevantSentenceId: Long? = null,

  // This can't be set directly and hence it's a 'val'. Once an action plan has been persisted on retrieval
  // of the associated referral this field will be automatically set by hibernate.
  @OneToOne(mappedBy = "referral", optional = true) @Fetch(JOIN) val actionPlan: ActionPlan? = null,

  // required fields
  @NotNull @ManyToOne(fetch = FetchType.LAZY) val intervention: Intervention,
  @NotNull val serviceUserCRN: String,
  @NotNull @ManyToOne @Fetch(FetchMode.JOIN) val createdBy: AuthUser,
  @NotNull val createdAt: OffsetDateTime,
  @Id val id: UUID,

  @OneToOne @Fetch(JOIN) var endOfServiceReport: EndOfServiceReport? = null,
) {
  fun getResponsibleProbationPractitioner(): AuthUser {
    // fixme: should this sentBy or createdBy?
    return createdBy
  }
}
