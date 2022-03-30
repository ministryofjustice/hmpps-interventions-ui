package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.LocalDate
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id

@Entity
data class ReferralDetails(
  @Id val id: UUID,
  var supersededById: UUID?,
  val referralId: UUID,
  val createdAt: OffsetDateTime,
  @Column(name = "created_by") val createdByUserId: String,
  val reasonForChange: String?,

  // actual referral details fields:
  var completionDeadline: LocalDate?,
  var furtherInformation: String?,
  var maximumEnforceableDays: Int?,
)
