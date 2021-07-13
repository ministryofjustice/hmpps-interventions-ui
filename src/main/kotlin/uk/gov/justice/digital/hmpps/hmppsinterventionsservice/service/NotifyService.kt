package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponentsBuilder
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception.AsyncEventExceptionHandling
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import java.net.URI

interface NotifyService {
  fun generateResourceUrl(baseURL: String, path: String, vararg args: Any): URI {
    return UriComponentsBuilder.fromHttpUrl(baseURL).path(path).buildAndExpand(*args).toUri()
  }
}

@Service
class NotifyActionPlanService(
  @Value("\${notify.templates.action-plan-submitted}") private val actionPlanSubmittedTemplateID: String,
  @Value("\${notify.templates.action-plan-approved}") private val actionPlanApprovedTemplateID: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.probation-practitioner.action-plan}") private val ppActionPlanLocation: String,
  @Value("\${interventions-ui.locations.service-provider.action-plan}") private val spActionPlanLocation: String,
  private val emailSender: EmailSender,
  private val hmppsAuthService: HMPPSAuthService,
) : ApplicationListener<ActionPlanEvent>, NotifyService {

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: ActionPlanEvent) {
    when (event.type) {
      ActionPlanEventType.SUBMITTED -> {
        val recipient = hmppsAuthService.getUserDetail(event.actionPlan.referral.sentBy!!)
        val location = generateResourceUrl(interventionsUIBaseURL, ppActionPlanLocation, event.actionPlan.referral.id)
        emailSender.sendEmail(
          actionPlanSubmittedTemplateID,
          recipient.email,
          mapOf(
            "submitterFirstName" to recipient.firstName,
            "referenceNumber" to event.actionPlan.referral.referenceNumber!!,
            "actionPlanUrl" to location.toString(),
          )
        )
      }
      ActionPlanEventType.APPROVED -> {
        val recipient = hmppsAuthService.getUserDetail(event.actionPlan.submittedBy!!)
        val location = generateResourceUrl(interventionsUIBaseURL, spActionPlanLocation, event.actionPlan.referral.id)
        emailSender.sendEmail(
          actionPlanApprovedTemplateID,
          recipient.email,
          mapOf(
            "submitterFirstName" to recipient.firstName,
            "referenceNumber" to event.actionPlan.referral.referenceNumber!!,
            "actionPlanUrl" to location.toString(),
          )
        )
      }
    }
  }
}

@Service
class NotifyEndOfServiceReportService(
  @Value("\${notify.templates.end-of-service-report-submitted}") private val endOfServiceReportSubmittedTemplateID: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.probation-practitioner.end-of-service-report}") private val ppEndOfServiceReportLocation: String,
  private val emailSender: EmailSender,
  private val hmppsAuthService: HMPPSAuthService,
) : ApplicationListener<EndOfServiceReportEvent>, NotifyService {

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: EndOfServiceReportEvent) {
    when (event.type) {
      EndOfServiceReportEventType.SUBMITTED -> {
        val userDetail = hmppsAuthService.getUserDetail(event.endOfServiceReport.referral.getResponsibleProbationPractitioner())
        val location = generateResourceUrl(interventionsUIBaseURL, ppEndOfServiceReportLocation, event.endOfServiceReport.id)
        emailSender.sendEmail(
          endOfServiceReportSubmittedTemplateID,
          userDetail.email,
          mapOf(
            "ppFirstName" to userDetail.firstName,
            "referralReference" to event.endOfServiceReport.referral.referenceNumber!!,
            "endOfServiceReportLink" to location.toString(),
          )
        )
      }
    }
  }
}

@Service
class NotifyActionPlanAppointmentService(
  @Value("\${notify.templates.appointment-not-attended}") private val appointmentNotAttendedTemplateID: String,
  @Value("\${notify.templates.concerning-behaviour}") private val concerningBehaviourTemplateID: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.probation-practitioner.session-feedback}") private val ppSessionFeedbackLocation: String,
  private val emailSender: EmailSender,
  private val hmppsAuthService: HMPPSAuthService,
) : ApplicationListener<ActionPlanAppointmentEvent>, NotifyService {
  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: ActionPlanAppointmentEvent) {
    if (event.notifyPP) {
      val referral = event.actionPlanSession.actionPlan.referral
      val ppDetails = hmppsAuthService.getUserDetail(referral.getResponsibleProbationPractitioner())
      val location = generateResourceUrl(
        interventionsUIBaseURL,
        ppSessionFeedbackLocation,
        event.actionPlanSession.actionPlan.id,
        event.actionPlanSession.sessionNumber,
      )

      when (event.type) {
        ActionPlanAppointmentEventType.ATTENDANCE_RECORDED -> {
          emailSender.sendEmail(
            appointmentNotAttendedTemplateID,
            ppDetails.email,
            mapOf(
              "ppFirstName" to ppDetails.firstName,
              "referenceNumber" to referral.referenceNumber!!,
              "attendanceUrl" to location.toString(),
            )
          )
        }
        ActionPlanAppointmentEventType.BEHAVIOUR_RECORDED -> {
          emailSender.sendEmail(
            concerningBehaviourTemplateID,
            ppDetails.email,
            mapOf(
              "ppFirstName" to ppDetails.firstName,
              "referenceNumber" to referral.referenceNumber!!,
              "sessionUrl" to location.toString(),
            )
          )
        }
      }
    }
  }
}

@Service
class NotifyAppointmentService(
  @Value("\${notify.templates.appointment-not-attended}") private val appointmentNotAttendedTemplateID: String,
  @Value("\${notify.templates.concerning-behaviour}") private val concerningBehaviourTemplateID: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.probation-practitioner.supplier-assessment-feedback}") private val ppSAASessionFeedbackLocation: String,
  @Value("\${interventions-ui.locations.probation-practitioner.session-feedback}") private val ppActionPlanSessionFeedbackLocation: String,
  private val emailSender: EmailSender,
  private val hmppsAuthService: HMPPSAuthService,
) : ApplicationListener<AppointmentEvent>, NotifyService {
  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: AppointmentEvent) {
    if (event.notifyPP) {
      val referral = event.appointment.referral
      val ppDetails = hmppsAuthService.getUserDetail(referral.getResponsibleProbationPractitioner())

      val location = when(event.appointmentType){
        AppointmentType.SUPPLIER_ASSESSMENT -> generateResourceUrl(
          interventionsUIBaseURL,
          ppSAASessionFeedbackLocation,
          event.appointment.referral.id
        )
        AppointmentType.SERVICE_DELIVERY -> run {
          log.error("asdghsd")
          return
        }
      }

//      val location = generateResourceUrl(
//        interventionsUIBaseURL,
//        endpoint,
//        event.appointment.referral.id
//      )

      when (event.type) {
        AppointmentEventType.ATTENDANCE_RECORDED -> {
          emailSender.sendEmail(
            appointmentNotAttendedTemplateID,
            ppDetails.email,
            mapOf(
              "ppFirstName" to ppDetails.firstName,
              "referenceNumber" to referral.referenceNumber!!,
              "attendanceUrl" to location.toString(),
            )
          )
        }
        AppointmentEventType.BEHAVIOUR_RECORDED -> {
          emailSender.sendEmail(
            concerningBehaviourTemplateID,
            ppDetails.email,
            mapOf(
              "ppFirstName" to ppDetails.firstName,
              "referenceNumber" to referral.referenceNumber!!,
              "sessionUrl" to location.toString(),
            )
          )
        }
      }
    }
  }
}


@Service
class NotifyReferralService(
  @Value("\${notify.templates.referral-sent}") private val referralSentTemplateID: String,
  @Value("\${notify.templates.referral-assigned}") private val referralAssignedTemplateID: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.service-provider.referral-details}") private val spReferralDetailsLocation: String,
  private val emailSender: EmailSender,
  private val hmppsAuthService: HMPPSAuthService,
) : ApplicationListener<ReferralEvent>, NotifyService {

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: ReferralEvent) {
    when (event.type) {
      ReferralEventType.SENT -> {
        val location = generateResourceUrl(interventionsUIBaseURL, spReferralDetailsLocation, event.referral.id)
        val intervention = event.referral.intervention
        val serviceProvider = intervention.dynamicFrameworkContract.primeProvider
        emailSender.sendEmail(
          referralSentTemplateID,
          intervention.incomingReferralDistributionEmail,
          mapOf(
            "organisationName" to serviceProvider.name,
            "referenceNumber" to event.referral.referenceNumber!!,
            "referralUrl" to location.toString(),
          )
        )
      }

      ReferralEventType.ASSIGNED -> {
        val userDetails = hmppsAuthService.getUserDetail(event.referral.currentAssignee!!)
        val location = generateResourceUrl(interventionsUIBaseURL, spReferralDetailsLocation, event.referral.id)
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
