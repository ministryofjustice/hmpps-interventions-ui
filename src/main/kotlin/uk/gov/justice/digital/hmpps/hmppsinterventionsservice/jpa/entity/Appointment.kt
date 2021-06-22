package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import com.fasterxml.jackson.annotation.JsonValue
import com.vladmihalcea.hibernate.type.basic.PostgreSQLEnumType
import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import java.time.OffsetDateTime
import java.util.UUID
import javax.persistence.CascadeType
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.persistence.OneToOne
import javax.persistence.PrimaryKeyJoinColumn
import javax.validation.constraints.NotNull

@Entity
@TypeDef(name = "attended", typeClass = PostgreSQLEnumType::class)
data class Appointment(
  @Type(type = "attended") @Enumerated(EnumType.STRING) var attended: Attended? = null,
  var additionalAttendanceInformation: String? = null,
  var attendanceSubmittedAt: OffsetDateTime? = null,

  var attendanceBehaviour: String? = null,
  var attendanceBehaviourSubmittedAt: OffsetDateTime? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var attendanceBehaviourSubmittedBy: AuthUser? = null,
  var notifyPPOfAttendanceBehaviour: Boolean? = null,

  var appointmentFeedbackSubmittedAt: OffsetDateTime? = null,
  @ManyToOne @Fetch(FetchMode.JOIN) var appointmentFeedbackSubmittedBy: AuthUser? = null,

  var deliusAppointmentId: Long? = null,

  @NotNull @ManyToOne @Fetch(FetchMode.JOIN) val createdBy: AuthUser,
  @NotNull val createdAt: OffsetDateTime,
  var appointmentTime: OffsetDateTime,
  var durationInMinutes: Int,

  @OneToOne(cascade = [CascadeType.ALL])
  @PrimaryKeyJoinColumn
  var appointmentDelivery: AppointmentDelivery? = null,

  @Id val id: UUID,
) {
  override fun equals(other: Any?): Boolean {
    if (other == null || other !is Appointment) {
      return false
    }

    return id == other.id
  }

  override fun hashCode(): Int {
    return id.hashCode()
  }
}

enum class Attended {
  YES,
  LATE,
  NO;

  @JsonValue
  open fun toLower(): String? {
    return this.toString().lowercase()
  }
}

enum class AppointmentType {
  SERVICE_DELIVERY,
  SUPPLIER_ASSESSMENT;
}
