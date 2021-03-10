package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Entity
@Table(name = "action_plan_appointment")
data class ActionPlanAppointment(

  // Attributes
  @NotNull val sessionNumber: Int,

  // Activities
  var appointmentTime: OffsetDateTime? = null,
  var durationInMinutes: Int? = null,

  // Status
  @NotNull @ManyToOne @Fetch(FetchMode.JOIN) val createdBy: AuthUser,
  @NotNull val createdAt: OffsetDateTime,

  // Required
  @NotNull @ManyToOne val actionPlan: ActionPlan,
  @Id val id: UUID,
) {

  // Due to the bi-direction relationship with action plan the action plan id should be used
  // in hashcode/equals to avoid stack overflow
  override fun equals(other: Any?): Boolean {
    if (this === other) return true
    if (javaClass != other?.javaClass) return false

    other as ActionPlanAppointment

    if (sessionNumber != other.sessionNumber) return false
    if (appointmentTime != other.appointmentTime) return false
    if (durationInMinutes != other.durationInMinutes) return false
    if (createdBy != other.createdBy) return false
    if (createdAt != other.createdAt) return false
    if (actionPlan.id != other.actionPlan.id) return false
    if (id != other.id) return false

    return true
  }

  override fun hashCode(): Int {
    var result = sessionNumber
    result = 31 * result + (appointmentTime?.hashCode() ?: 0)
    result = 31 * result + (durationInMinutes ?: 0)
    result = 31 * result + createdBy.hashCode()
    result = 31 * result + createdAt.hashCode()
    result = 31 * result + actionPlan.id.hashCode()
    result = 31 * result + id.hashCode()
    return result
  }
}
