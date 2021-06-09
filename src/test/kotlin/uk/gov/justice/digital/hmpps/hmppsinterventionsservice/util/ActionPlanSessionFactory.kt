package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlan
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import java.time.OffsetDateTime
import java.util.UUID

class ActionPlanSessionFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val actionPlanFactory = ActionPlanFactory(em)

  fun create(
    id: UUID = UUID.randomUUID(),
    actionPlan: ActionPlan = actionPlanFactory.create(),
    sessionNumber: Int = 1,
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = actionPlan.createdBy,
    attended: Attended? = null,
    additionalAttendanceInformation: String? = null,
    attendanceSubmittedAt: OffsetDateTime? = null,
    notifyPPOfAttendanceBehaviour: Boolean? = null,
    sessionFeedbackSubmittedAt: OffsetDateTime? = null,
  ): ActionPlanSession {
    return save(
      ActionPlanSession(
        id = id,
        actionPlan = actionPlan,
        sessionNumber = sessionNumber,
        createdAt = createdAt,
        createdBy = createdBy,
        attended = attended,
        additionalAttendanceInformation = additionalAttendanceInformation,
        attendanceSubmittedAt = attendanceSubmittedAt,
        notifyPPOfAttendanceBehaviour = notifyPPOfAttendanceBehaviour,
        sessionFeedbackSubmittedAt = sessionFeedbackSubmittedAt,
      )
    )
  }

  fun createAttended(
    id: UUID = UUID.randomUUID(),
    actionPlan: ActionPlan = actionPlanFactory.create(),
    sessionNumber: Int = 1,
    createdAt: OffsetDateTime = OffsetDateTime.now(),
    createdBy: AuthUser = actionPlan.createdBy,
    attended: Attended? = Attended.YES,
    attendanceSubmittedAt: OffsetDateTime? = createdAt,
    notifyPPOfAttendanceBehaviour: Boolean? = false,
    sessionFeedbackSubmittedAt: OffsetDateTime? = attendanceSubmittedAt,
  ): ActionPlanSession {
    return save(
      ActionPlanSession(
        id = id,
        actionPlan = actionPlan,
        sessionNumber = sessionNumber,
        createdAt = createdAt,
        createdBy = createdBy,
        attended = attended,
        attendanceSubmittedAt = attendanceSubmittedAt,
        notifyPPOfAttendanceBehaviour = notifyPPOfAttendanceBehaviour,
        sessionFeedbackSubmittedAt = sessionFeedbackSubmittedAt,
      )
    )
  }
}
