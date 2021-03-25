package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import com.fasterxml.jackson.annotation.JsonValue
import com.vladmihalcea.hibernate.type.basic.PostgreSQLEnumType
import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
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
@TypeDef(name = "attended", typeClass = PostgreSQLEnumType::class)
data class ActionPlanAppointment(

  // Attributes
  @NotNull val sessionNumber: Int,
  @Type(type = "attended")
  @Enumerated(EnumType.STRING)
  var attended: Attended? = null,
  var additionalAttendanceInformation: String? = null,

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

enum class Attended {
  YES,
  LATE,
  NO;

  @JsonValue
  open fun toLower(): String? {
    return this.toString().toLowerCase()
  }
}
