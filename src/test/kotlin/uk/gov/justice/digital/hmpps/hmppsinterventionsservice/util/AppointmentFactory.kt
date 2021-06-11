package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import java.time.OffsetDateTime
import java.util.UUID

class AppointmentFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val authUserFactory = AuthUserFactory(em)

  fun create(
    id: UUID = UUID.randomUUID(),
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = authUserFactory.create(),
    appointmentTime: OffsetDateTime = OffsetDateTime.now().plusMonths(2),
    durationInMinutes: Int = 60,
    attended: Attended? = null,
    additionalAttendanceInformation: String? = null,
    attendanceSubmittedAt: OffsetDateTime? = null,
    attendanceBehaviour: String? = null,
    attendanceBehaviourSubmittedAt: OffsetDateTime? = null,
    notifyPPOfAttendanceBehaviour: Boolean? = null,
    appointmentFeedbackSubmittedAt: OffsetDateTime? = null,
    appointmentFeedbackSubmittedBy: AuthUser? = null,
    deliusAppointmentId: Long? = null,
  ): Appointment {
    return save(
      Appointment(
        id = id,
        createdAt = createdAt,
        createdBy = createdBy,
        appointmentTime = appointmentTime,
        durationInMinutes = durationInMinutes,
        attended = attended,
        additionalAttendanceInformation = additionalAttendanceInformation,
        attendanceSubmittedAt = attendanceSubmittedAt,
        attendanceBehaviour = attendanceBehaviour,
        attendanceBehaviourSubmittedAt = attendanceBehaviourSubmittedAt,
        notifyPPOfAttendanceBehaviour = notifyPPOfAttendanceBehaviour,
        appointmentFeedbackSubmittedAt = appointmentFeedbackSubmittedAt,
        appointmentFeedbackSubmittedBy = appointmentFeedbackSubmittedBy,
        deliusAppointmentId = deliusAppointmentId,
      )
    )
  }
}
