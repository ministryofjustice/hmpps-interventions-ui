package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.SNSPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception.AsyncEventExceptionHandling
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended

interface SNSService

@Service
class SNSActionPlanService(
  private val snsPublisher: SNSPublisher,
) : ApplicationListener<ActionPlanEvent>, SNSService {

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: ActionPlanEvent) {
    when (event.type) {
      ActionPlanEventType.SUBMITTED -> {
        val snsEvent = EventDTO(
          "intervention.action-plan.submitted",
          "A draft action plan has been submitted",
          event.detailUrl,
          event.actionPlan.submittedAt!!,
          mapOf("actionPlanId" to event.actionPlan.id, "submittedBy" to (event.actionPlan.submittedBy?.userName!!))
        )
        snsPublisher.publish(event.actionPlan.referral.id, event.actionPlan.submittedBy!!, snsEvent)
      }
      ActionPlanEventType.APPROVED -> {
        val snsEvent = EventDTO(
          "intervention.action-plan.approved",
          "An action plan has been approved",
          event.detailUrl,
          event.actionPlan.approvedAt!!,
          mapOf("actionPlanId" to event.actionPlan.id, "approvedBy" to (event.actionPlan.approvedBy?.userName!!))
        )
        snsPublisher.publish(event.actionPlan.referral.id, event.actionPlan.approvedBy!!, snsEvent)
      }
    }
  }
}

@Service
class SNSReferralService(
  private val snsPublisher: SNSPublisher,
) : ApplicationListener<ReferralEvent>, SNSService {

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        val snsEvent = EventDTO(
          "intervention.referral.sent",
          "A referral has been sent to a Service Provider",
          event.detailUrl,
          event.referral.sentAt!!,
          mapOf("referralId" to event.referral.id)
        )
        snsPublisher.publish(event.referral.id, event.referral.sentBy!!, snsEvent)
      }
      ReferralEventType.ASSIGNED -> {
        val assignment = event.referral.currentAssignment!!
        val snsEvent = EventDTO(
          "intervention.referral.assigned",
          "A referral has been assigned to a caseworker / service provider",
          event.detailUrl,
          assignment.assignedAt,
          mapOf("referralId" to event.referral.id, "assignedTo" to (assignment.assignedTo.userName))
        )
        snsPublisher.publish(event.referral.id, assignment.assignedBy, snsEvent)
      }
    }
  }
}

@Service
class SNSAppointmentService(
  private val snsPublisher: SNSPublisher,
) : ApplicationListener<AppointmentEvent>, SNSService {

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: AppointmentEvent) {
    when (event.type) {
      AppointmentEventType.ATTENDANCE_RECORDED -> {
        val referral = event.actionPlanSession.actionPlan.referral
        val appointment = event.actionPlanSession.currentAppointment
          ?: throw RuntimeException("event triggered for session with no appointments")

        val eventType = "intervention.session-appointment.${when (appointment.attended) {
          Attended.YES, Attended.LATE -> "attended"
          Attended.NO -> "missed"
          null -> throw RuntimeException("event triggered for appointment with no recorded attendance")
        }}"

        val snsEvent = EventDTO(
          eventType,
          "Attendance was recorded for a session appointment",
          event.detailUrl,
          appointment.attendanceSubmittedAt!!,
          mapOf("serviceUserCRN" to referral.serviceUserCRN, "referralId" to referral.id)
        )

        snsPublisher.publish(referral.id, appointment.appointmentFeedbackSubmittedBy!!, snsEvent)
      }
    }
  }
}
