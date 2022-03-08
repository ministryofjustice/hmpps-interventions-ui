package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.DeliverySessionDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.SentReferralDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventType.SESSION_FEEDBACK_RECORDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.NO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.lang.IllegalStateException
import java.time.OffsetDateTime
import java.util.UUID

interface CommunityAPIService {
  fun getNotes(referral: Referral, url: String, description: String): String {
    val contractTypeName = referral.intervention.dynamicFrameworkContract.contractType.name
    val primeProviderName = referral.intervention.dynamicFrameworkContract.primeProvider.name
    return "$description for $contractTypeName Referral ${referral.referenceNumber} with Prime Provider $primeProviderName\n$url"
  }

  fun getNotes(referral: SentReferralDTO, url: String, description: String, contractTypeName: String, primeProviderName: String): String {
    return "$description for $contractTypeName Referral ${referral.referenceNumber} with Prime Provider $primeProviderName\n$url"
  }

  fun setNotifyPPIfRequired(appointment: Appointment) =
    NO == appointment.attended || appointment.notifyPPOfAttendanceBehaviour == true

  fun setNotifyPPIfRequired(deliverySession: DeliverySessionDTO) =
    NO == deliverySession.sessionFeedback.attendance.attended || deliverySession.sessionFeedback.behaviour.notifyProbationPractitioner == true
}

@Service
class CommunityAPIReferralEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.probation-practitioner.referral-details}") private val ppReferralDetailsLocation: String,
  @Value("\${interventions-ui.locations.probation-practitioner.end-of-service-report}") private val ppEndOfServiceReportLocation: String,
  @Value("\${community-api.locations.ended-referral}") private val communityAPIEndedReferralLocation: String,
  @Value("\${community-api.locations.notification-request}") private val communityAPINotificationLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<ReferralEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        // Has become a synchronous call so no action required here
        // This is due to the link to delius not being robust at the moment
        // As soon as it is made resilient this route will be reinstated
        // Functionality moved to CommunityApiReferralService
      }
      ReferralEventType.CANCELLED,
      -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(ppReferralDetailsLocation)
          .buildAndExpand(event.referral.id)
          .toString()

        postReferralEndRequest(event, url)
      }
      ReferralEventType.PREMATURELY_ENDED,
      ReferralEventType.COMPLETED,
      -> {

        // This should be an independent event based notification
        // However a race condition arises with the referral end
        // notification. To Avoid a NSI not found in community-api
        // this must be sent and processed before referral end
        postSyncNotificationRequest(event.referral.endOfServiceReport)

        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(ppEndOfServiceReportLocation)
          .buildAndExpand(event.referral.endOfServiceReport!!.id)
          .toString()

        postReferralEndRequest(event, url)
      }
      else -> {}
    }
  }

  private fun postReferralEndRequest(event: ReferralEvent, url: String) {
    val referralEndRequest = ReferralEndRequest(
      event.referral.intervention.dynamicFrameworkContract.contractType.code,
      event.referral.sentAt!!,
      event.referral.concludedAt!!,
      event.referral.relevantSentenceId!!,
      event.referral.id,
      event.type.name,
      getNotes(event.referral, url, "Referral Ended"),
    )

    val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPIEndedReferralLocation)
      .buildAndExpand(event.referral.serviceUserCRN, integrationContext)
      .toString()

    communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, referralEndRequest)
  }

  private fun postSyncNotificationRequest(endOfServiceReport: EndOfServiceReport?) {

    endOfServiceReport?.submittedAt ?: run {
      throw IllegalStateException("End of service report not submitted so should not get to this point")
    }

    val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
      .path(ppEndOfServiceReportLocation)
      .buildAndExpand(endOfServiceReport!!.id)
      .toString()

    postSyncNotificationRequest(endOfServiceReport, url)
  }

  private fun postSyncNotificationRequest(endOfServiceReport: EndOfServiceReport, url: String) {

    val referral = endOfServiceReport.referral

    val request = NotificationCreateRequestDTO(
      endOfServiceReport.referral.intervention.dynamicFrameworkContract.contractType.code,
      referral.sentAt!!,
      referral.id,
      endOfServiceReport.submittedAt!!,
      getNotes(referral, url, "End of Service Report Submitted"),
    )

    val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPINotificationLocation)
      .buildAndExpand(referral.serviceUserCRN, referral.relevantSentenceId!!, integrationContext)
      .toString()

    communityAPIClient.makeSyncPostRequest(communityApiSentReferralPath, request, Unit::class.java)
  }
}

@Service
class CommunityAPIActionPlanEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.probation-practitioner.action-plan}") private val ppActionPlanLocation: String,
  @Value("\${community-api.locations.notification-request}") private val communityAPINotificationLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<ActionPlanEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: ActionPlanEvent) {
    when (event.type) {
      ActionPlanEventType.SUBMITTED -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(ppActionPlanLocation)
          .buildAndExpand(event.actionPlan.referral.id)
          .toString()

        postNotificationRequest(event, url, "Submitted", event.actionPlan.submittedAt!!)
      }
      ActionPlanEventType.APPROVED -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(ppActionPlanLocation)
          .buildAndExpand(event.actionPlan.referral.id)
          .toString()

        postNotificationRequest(event, url, "Approved", event.actionPlan.approvedAt!!)
      }
    }
  }

  private fun postNotificationRequest(event: ActionPlanEvent, url: String, status: String, eventTime: OffsetDateTime) {

    val referral = event.actionPlan.referral

    val request = NotificationCreateRequestDTO(
      referral.intervention.dynamicFrameworkContract.contractType.code,
      referral.sentAt!!,
      referral.id,
      eventTime,
      getNotes(referral, url, "Action Plan $status"),
    )

    val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPINotificationLocation)
      .buildAndExpand(referral.serviceUserCRN, referral.relevantSentenceId!!, integrationContext)
      .toString()

    communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, request)
  }
}

@Service
class CommunityAPIActionPlanAppointmentEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.probation-practitioner.session-feedback}") private val ppSessionFeedbackLocation: String,
  @Value("\${community-api.appointments.outcome.enabled}") private val outcomeNotificationEnabled: Boolean,
  @Value("\${community-api.locations.appointment-outcome-request}") private val communityAPIAppointmentOutcomeLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<ActionPlanAppointmentEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: ActionPlanAppointmentEvent) {
    when (event.type) {
      SESSION_FEEDBACK_RECORDED -> {
        if (!outcomeNotificationEnabled) {
          return
        }
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(ppSessionFeedbackLocation)
          .buildAndExpand(event.referral.id, event.deliverySession.sessionNumber)
          .toString()

        val notifyPP = setNotifyPPIfRequired(event.deliverySession)

        val request = AppointmentOutcomeRequest(
          getNotes(event.referral, url, "Session Feedback Recorded", event.contractTypeName, event.primeProviderName),
          event.deliverySession.sessionFeedback.attendance.attended!!.name,
          notifyPP
        )

        val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPIAppointmentOutcomeLocation)
          .buildAndExpand(event.referral.serviceUserCRN, event.deliverySession.deliusAppointmentId, integrationContext)
          .toString()

        communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, request)
      }
      else -> {}
    }
  }
}

@Service
class CommunityAPIAppointmentEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.probation-practitioner.supplier-assessment-feedback}") private val ppSessionFeedbackLocation: String,
  @Value("\${community-api.appointments.outcome.enabled}") private val outcomeNotificationEnabled: Boolean,
  @Value("\${community-api.locations.appointment-outcome-request}") private val communityAPIAppointmentOutcomeLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<AppointmentEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: AppointmentEvent) {
    when (event.type) {
      AppointmentEventType.SESSION_FEEDBACK_RECORDED -> {
        if (!outcomeNotificationEnabled) {
          return
        }

        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(ppSessionFeedbackLocation)
          .buildAndExpand(event.appointment.referral.id)
          .toString()

        val appointment = event.appointment
        val notifyPP = setNotifyPPIfRequired(appointment)

        val request = AppointmentOutcomeRequest(
          getNotes(event.appointment.referral, url, "Session Feedback Recorded"),
          appointment.attended!!.name,
          notifyPP
        )

        val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPIAppointmentOutcomeLocation)
          .buildAndExpand(event.appointment.referral.serviceUserCRN, appointment.deliusAppointmentId, integrationContext)
          .toString()

        communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, request)
      }
      else -> {}
    }
  }
}

data class ReferralEndRequest(
  val contractType: String,
  val startedAt: OffsetDateTime,
  val endedAt: OffsetDateTime,
  val sentenceId: Long,
  val referralId: UUID,
  val endType: String,
  val notes: String,
)

data class NotificationCreateRequestDTO(
  val contractType: String,
  val referralStart: OffsetDateTime,
  val referralId: UUID,
  val contactDateTime: OffsetDateTime,
  val notes: String
)

data class AppointmentOutcomeRequest(
  val notes: String,
  val attended: String,
  val notifyPPOfAttendanceBehaviour: Boolean,
)