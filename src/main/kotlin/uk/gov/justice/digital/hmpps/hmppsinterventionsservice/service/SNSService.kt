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
        snsPublisher.publish(event.actionPlan.referral.id, event.actionPlan.submittedBy, snsEvent)
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
        snsPublisher.publish(event.referral.id, event.referral.sentBy, snsEvent)
      }
      ReferralEventType.ASSIGNED -> {
        val snsEvent = EventDTO(
          "intervention.referral.assigned",
          "A referral has been assigned to a caseworker / service provider",
          event.detailUrl,
          event.referral.assignedAt!!,
          mapOf("referralId" to event.referral.id, "assignedTo" to (event.referral.assignedTo?.userName!!))
        )
        snsPublisher.publish(event.referral.id, event.referral.assignedBy, snsEvent)
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
        val referral = event.appointment.actionPlan.referral
        val eventType = "intervention.session-appointment.${when (event.appointment.attended) {
          Attended.YES, Attended.LATE -> "attended"
          Attended.NO -> "missed"
          null -> throw RuntimeException("event triggered for appointment with no recorded attendance")
        }}"
        val snsEvent = EventDTO(
          eventType,
          "Attendance was recorded for a session appointment",
          event.detailUrl,
          event.appointment.attendanceSubmittedAt!!,
          mapOf("serviceUserCRN" to referral.serviceUserCRN, "referralId" to referral.id)
        )
        // FIXME we don't know who submits these -- needs explicit actor
        snsPublisher.publish(referral.id, null, snsEvent)
      }
    }
  }
}
