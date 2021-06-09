package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

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
import javax.validation.constraints.NotNull

@Entity
@TypeDef(name = "attended", typeClass = PostgreSQLEnumType::class)
data class Appointment(
  @Type(type = "attended") @Enumerated(EnumType.STRING) var attended: Attended? = null,
  var additionalAttendanceInformation: String? = null,
  var attendanceSubmittedAt: OffsetDateTime? = null,

  var attendanceBehaviour: String? = null,
  var attendanceBehaviourSubmittedAt: OffsetDateTime? = null,
  var notifyPPOfAttendanceBehaviour: Boolean? = null,

  var appointmentFeedbackSubmittedAt: OffsetDateTime? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var appointmentFeedbackSubmittedBy: AuthUser? = null,

  var deliusAppointmentId: Long? = null,

  @NotNull @ManyToOne @Fetch(FetchMode.JOIN) val createdBy: AuthUser,
  @NotNull val createdAt: OffsetDateTime,
  var appointmentTime: OffsetDateTime,
  var durationInMinutes: Int,

  @Id val id: UUID,
)
