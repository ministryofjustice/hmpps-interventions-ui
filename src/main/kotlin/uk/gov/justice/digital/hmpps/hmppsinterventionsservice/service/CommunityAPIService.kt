package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType.SESSION_FEEDBACK_RECORDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
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
}

@Service
class CommunityAPIOffenderService(
  @Value("\${community-api.locations.offender-access}") private val offenderAccessLocation: String,
  private val communityAPIClient: CommunityAPIClient,
) {
  fun checkIfAuthenticatedDeliusUserHasAccessToServiceUser(user: AuthUser, crn: String): ServiceUserAccessResult {
    val userAccessPath = UriComponentsBuilder.fromPath(offenderAccessLocation)
      .buildAndExpand(crn)
      .toString()

    val response = communityAPIClient.makeSyncGetRequest(userAccessPath, UserAccessResponse::class.java)

    return ServiceUserAccessResult(
      !(response.userExcluded || response.userRestricted),
      listOfNotNull(response.exclusionMessage, response.restrictionMessage),
    )
  }
}

@Service
class CommunityAPIReferralEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.sent-referral}") private val interventionsUISentReferralLocation: String,
  @Value("\${interventions-ui.locations.cancelled-referral}") private val interventionsUICancelledReferralLocation: String,
  @Value("\${interventions-ui.locations.submit-end-of-service-report}") private val interventionsUIEndOfServiceReportLocation: String,
  @Value("\${community-api.locations.sent-referral}") private val communityAPISentReferralLocation: String,
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
          .path(interventionsUICancelledReferralLocation)
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
        postNotificationRequest(event.referral.endOfServiceReport)

        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUIEndOfServiceReportLocation)
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

  private fun postNotificationRequest(endOfServiceReport: EndOfServiceReport?) {

    endOfServiceReport?.submittedAt ?: run {
      throw IllegalStateException("End of service report not submitted so should not get to this point")
    }

    val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
      .path(interventionsUIEndOfServiceReportLocation)
      .buildAndExpand(endOfServiceReport!!.id)
      .toString()

    postNotificationRequest(endOfServiceReport, url)
  }

  private fun postNotificationRequest(endOfServiceReport: EndOfServiceReport, url: String) {

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

    communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, request)
  }
}

@Service
class CommunityAPIEndOfServiceReportEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.submit-end-of-service-report}") private val interventionsUIEndOfServiceReportLocation: String,
  @Value("\${community-api.locations.notification-request}") private val communityAPINotificationLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<EndOfServiceReportEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: EndOfServiceReportEvent) {
    // Moved to referral end notification as there is a race condition arising between
    // them. Should the referral be updated as completed before EoSR is notified,
    // community-api will reject it saying NSI does not exist.
  }
}

@Service
class CommunityAPIActionPlanEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.submit-action-plan}") private val interventionsUIActionPlanLocation: String,
  @Value("\${community-api.locations.notification-request}") private val communityAPINotificationLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<ActionPlanEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: ActionPlanEvent) {
    when (event.type) {
      ActionPlanEventType.SUBMITTED,
      -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUIActionPlanLocation)
          .buildAndExpand(event.actionPlan.referral.id)
          .toString()

        postNotificationRequest(event, url)
      }
    }
  }

  private fun postNotificationRequest(event: ActionPlanEvent, url: String) {

    val referral = event.actionPlan.referral

    val request = NotificationCreateRequestDTO(
      referral.intervention.dynamicFrameworkContract.contractType.code,
      referral.sentAt!!,
      referral.id,
      event.actionPlan.submittedAt!!,
      getNotes(referral, url, "Action Plan Submitted"),
    )

    val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPINotificationLocation)
      .buildAndExpand(referral.serviceUserCRN, referral.relevantSentenceId!!, integrationContext)
      .toString()

    communityAPIClient.makeAsyncPostRequest(communityApiSentReferralPath, request)
  }
}
@Service
class CommunityAPIAppointmentEventService(
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.session-feedback}") private val interventionsUISessionFeedbackLocation: String,
  @Value("\${community-api.locations.appointment-outcome-request}") private val communityAPIAppointmentOutcomeLocation: String,
  @Value("\${community-api.integration-context}") private val integrationContext: String,
  private val communityAPIClient: CommunityAPIClient,
) : ApplicationListener<AppointmentEvent>, CommunityAPIService {
  companion object : KLogging()

  override fun onApplicationEvent(event: AppointmentEvent) {
    when (event.type) {
      SESSION_FEEDBACK_RECORDED -> {
        val url = UriComponentsBuilder.fromHttpUrl(interventionsUIBaseURL)
          .path(interventionsUISessionFeedbackLocation)
          .buildAndExpand(event.actionPlanSession.actionPlan.referral.id, event.actionPlanSession.sessionNumber)
          .toString()

        val request = AppointmentOutcomeRequest(
          getNotes(event.actionPlanSession.actionPlan.referral, url, "Session Feedback Recorded"),
          event.actionPlanSession.attended!!.name,
          event.actionPlanSession.notifyPPOfAttendanceBehaviour ?: false
        )

        val communityApiSentReferralPath = UriComponentsBuilder.fromPath(communityAPIAppointmentOutcomeLocation)
          .buildAndExpand(event.actionPlanSession.actionPlan.referral.serviceUserCRN, event.actionPlanSession.deliusAppointmentId, integrationContext)
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

data class UserAccessResponse(
  val userExcluded: Boolean,
  val userRestricted: Boolean,
  val exclusionMessage: String?,
  val restrictionMessage: String?,
)

data class ServiceUserAccessResult(
  val canAccess: Boolean,
  val messages: List<String>,
)
