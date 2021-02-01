package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.CollectionTable
import javax.persistence.Column
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Index
import javax.persistence.ManyToOne
import javax.persistence.OneToOne
import javax.persistence.PrimaryKeyJoinColumn
import javax.persistence.Table
import javax.persistence.UniqueConstraint
import javax.validation.constraints.NotNull

@Entity
@Table(indexes = arrayOf(Index(columnList = "created_by_id")))
data class Referral(
  var sentAt: OffsetDateTime? = null,
  @ManyToOne(fetch = FetchType.LAZY) var sentBy: AuthUser? = null,
  var referenceNumber: String? = null,

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
  var serviceCategoryID: UUID? = null,
  var usingRarDays: Boolean? = null,
  var maximumRarDays: Int? = null,
  @NotNull @ManyToOne(fetch = FetchType.LAZY) var createdBy: AuthUser? = null,
  @ElementCollection
  @CollectionTable(
    name = "referral_desired_outcome",
    uniqueConstraints = [UniqueConstraint(columnNames = arrayOf("referral_id", "desired_outcome_id"))]
  )
  @Column(name = "desired_outcome_id")
  var desiredOutcomesIDs: List<UUID>? = null,
  var completionDeadline: LocalDate? = null,

  @NotNull @ManyToOne(fetch = FetchType.LAZY) val intervention: Intervention,
  @NotNull val serviceUserCRN: String,
  @CreationTimestamp var createdAt: OffsetDateTime? = null,
  @Id @GeneratedValue var id: UUID? = null,
)
