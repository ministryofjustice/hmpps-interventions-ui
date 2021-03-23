package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Entity
@Table(name = "action_plan_appointment")
data class ActionPlanAppointment(

  // Attributes
  @NotNull val sessionNumber: Int,
  @Enumerated(EnumType.STRING)
  var sessionAttendance: SessionAttendance? = null,
  var additionalInformation: String? = null,

  // Activities
  var appointmentTime: OffsetDateTime? = null,
  var durationInMinutes: Int? = null,

  // Status
  @NotNull @ManyToOne @Fetch(FetchMode.JOIN) val createdBy: AuthUser,
  @NotNull val createdAt: OffsetDateTime,

  // Required
  @NotNull @ManyToOne val actionPlan: ActionPlan,
  @Id val id: UUID,
)

enum class SessionAttendance {
  YES,
  LATE,
  NO
}
