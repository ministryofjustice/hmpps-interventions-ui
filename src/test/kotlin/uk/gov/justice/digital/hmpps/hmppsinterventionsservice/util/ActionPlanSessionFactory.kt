package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.time.OffsetDateTime
import java.util.UUID

class ActionPlanSessionFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val referralFactory = ReferralFactory(em)
  private val appointmentFactory = AppointmentFactory(em)

  fun createUnscheduled(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    sessionNumber: Int = 1,
  ): ActionPlanSession {
    return save(
      ActionPlanSession(
        id = id,
        referral = referral,
        sessionNumber = sessionNumber,
        appointments = mutableSetOf(),
      )
    )
  }

  fun createScheduled(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    sessionNumber: Int = 1,
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = referral.createdBy,
    appointmentTime: OffsetDateTime = OffsetDateTime.now().plusMonths(1),
    durationInMinutes: Int = 120,
    deliusAppointmentId: Long? = null,
  ): ActionPlanSession {
    val appointment = appointmentFactory.create(
      createdBy = createdBy,
      createdAt = createdAt,
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      appointmentFeedbackSubmittedBy = createdBy,
      deliusAppointmentId = deliusAppointmentId,
    )

    return save(
      ActionPlanSession(
        id = id,
        referral = referral,
        sessionNumber = sessionNumber,
        appointments = mutableSetOf(appointment),
      )
    )
  }

  fun createAttended(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    sessionNumber: Int = 1,
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = referral.createdBy,
    appointmentTime: OffsetDateTime = OffsetDateTime.now().plusMonths(1),
    durationInMinutes: Int = 120,
    deliusAppointmentId: Long? = null,
    attended: Attended? = Attended.YES,
    attendanceSubmittedAt: OffsetDateTime? = createdAt,
    additionalAttendanceInformation: String? = null,
    notifyPPOfAttendanceBehaviour: Boolean? = false,
    appointmentFeedbackSubmittedAt: OffsetDateTime? = attendanceSubmittedAt,
    appointmentFeedbackSubmittedBy: AuthUser? = createdBy,
  ): ActionPlanSession {
    val appointment = appointmentFactory.create(
      createdBy = createdBy,
      createdAt = createdAt,
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = deliusAppointmentId,
      attended = attended,
      attendanceSubmittedAt = attendanceSubmittedAt,
      additionalAttendanceInformation = additionalAttendanceInformation,
      notifyPPOfAttendanceBehaviour = notifyPPOfAttendanceBehaviour,
      appointmentFeedbackSubmittedAt = appointmentFeedbackSubmittedAt,
      appointmentFeedbackSubmittedBy = appointmentFeedbackSubmittedBy,
    )

    return save(
      ActionPlanSession(
        id = id,
        referral = referral,
        sessionNumber = sessionNumber,
        appointments = mutableSetOf(appointment),
      )
    )
  }
}
