package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id
import javax.persistence.Index
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Entity
@Table(indexes = arrayOf(Index(columnList = "created_by_userid")))
data class Referral(
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
  @NotNull var createdByUserAuthSource: String? = null,
  @Column(name = "created_by_userid") @NotNull var createdByUserID: String? = null,
  var completionDeadline: LocalDate? = null,
  @CreationTimestamp var created: OffsetDateTime? = null,
  @Id @GeneratedValue var id: UUID? = null,
)
