package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.CollectionTable
import javax.persistence.ElementCollection
import javax.persistence.Entity
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
  @CollectionTable(name = "action_plan_activity", joinColumns = [JoinColumn(name = "action_plan_id")])
  @NotNull val activities: MutableList<ActionPlanActivity> = mutableListOf(),

  // Status
  @NotNull @ManyToOne @Fetch(FetchMode.JOIN) val createdBy: AuthUser,
  @NotNull val createdAt: OffsetDateTime,
  @ManyToOne @Fetch(FetchMode.JOIN) var submittedBy: AuthUser? = null,
  var submittedAt: OffsetDateTime? = null,

  // Required
  @NotNull @OneToOne @Fetch(FetchMode.JOIN) val referral: Referral,
  @Id val id: UUID,
)
