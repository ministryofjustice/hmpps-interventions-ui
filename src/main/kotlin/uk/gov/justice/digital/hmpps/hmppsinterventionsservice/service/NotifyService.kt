package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception.AsyncEventExceptionHandling
import java.net.URI
import java.util.UUID

interface NotifyService {
  fun generateResourceUrl(baseURL: String, path: String, id: UUID): URI {
    return UriComponentsBuilder.fromHttpUrl(baseURL).path(path).buildAndExpand(id).toUri()
  }
}

@Service
class NotifyActionPlanService(
  @Value("\${notify.templates.action-plan-submitted}") private val actionPlanSubmittedTemplateID: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.submit-action-plan}") private val interventionsUISubmitActionPlanLocation: String,
  private val emailSender: EmailSender,
  private val hmppsAuthService: HMPPSAuthService,
) : ApplicationListener<ActionPlanEvent>, NotifyService {

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: ActionPlanEvent) {
    when (event.type) {

      ActionPlanEventType.SUBMITTED -> {
        val userDetail = hmppsAuthService.getUserDetail(event.actionPlan.submittedBy!!)
        val location = generateResourceUrl(interventionsUIBaseURL, interventionsUISubmitActionPlanLocation, event.actionPlan.id)
        emailSender.sendEmail(
          actionPlanSubmittedTemplateID,
          userDetail.email,
          mapOf(
            "submitterFirstName" to userDetail.firstName,
            "referenceNumber" to event.actionPlan.referral.referenceNumber!!,
            "actionPlanUrl" to location.toString(),
          )
        )
      }
    }
  }
}

@Service
class NotifyReferralService(
  @Value("\${notify.templates.referral-sent}") private val referralSentTemplateID: String,
  @Value("\${notify.templates.referral-assigned}") private val referralAssignedTemplateID: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.sent-referral}") private val interventionsUISentReferralLocation: String,
  private val emailSender: EmailSender,
  private val hmppsAuthService: HMPPSAuthService,
) : ApplicationListener<ReferralEvent>, NotifyService {

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {

      ReferralEventType.SENT -> {
        val location = generateResourceUrl(interventionsUIBaseURL, interventionsUISentReferralLocation, event.referral.id)
        val serviceProvider = event.referral.intervention.dynamicFrameworkContract.serviceProvider
        emailSender.sendEmail(
          referralSentTemplateID,
          serviceProvider.incomingReferralDistributionEmail,
          mapOf(
            "organisationName" to serviceProvider.name,
            "referenceNumber" to event.referral.referenceNumber!!,
            "referralUrl" to location.toString(),
          )
        )
      }

      ReferralEventType.ASSIGNED -> {
        val userDetails = hmppsAuthService.getUserDetail(event.referral.assignedTo!!)
        val location = generateResourceUrl(interventionsUIBaseURL, interventionsUISentReferralLocation, event.referral.id)
        emailSender.sendEmail(
          referralAssignedTemplateID,
          userDetails.email,
          mapOf(
            "spFirstName" to userDetails.firstName,
            "referenceNumber" to event.referral.referenceNumber!!,
            "referralUrl" to location.toString(),
          )
        )
      }
    }
  }
}
