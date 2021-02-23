package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.CollectionTable
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.OneToOne
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Entity
@Table(name = "action_plan")
data class ActionPlan(

  // Attributes
  var numberOfSessions: Int? = null,

  // Activities
  @ElementCollection
  @CollectionTable(name = "action_plan_activity", joinColumns = [JoinColumn(name = "id")])
  @NotNull val activities: List<ActionPlanActivity> = emptyList(),

  // Status
  @NotNull @ManyToOne(fetch = FetchType.LAZY) val createdBy: AuthUser,
  @NotNull val createdAt: OffsetDateTime,
  @ManyToOne(fetch = FetchType.LAZY) val submittedBy: AuthUser? = null,
  val submittedAt: OffsetDateTime? = null,

  // Required
  @NotNull @OneToOne(fetch = FetchType.LAZY) val referral: Referral,
  @Id val id: UUID,
)
