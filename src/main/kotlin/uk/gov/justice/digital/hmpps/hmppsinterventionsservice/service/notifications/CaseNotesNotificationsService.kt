package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.CreateCaseNoteEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception.AsyncEventExceptionHandling
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import java.util.UUID
import javax.transaction.Transactional

@Service
@Transactional
class CaseNotesNotificationsService(
  @Value("\${notify.templates.case-note-sent}") private val sentTemplate: String,
  @Value("\${interventions-ui.baseurl}") private val interventionsUIBaseURL: String,
  @Value("\${interventions-ui.locations.service-provider.case-note-details}") private val spCaseNoteLocation: String,
  @Value("\${interventions-ui.locations.probation-practitioner.case-note-details}") private val ppCaseNoteLocation: String,
  private val emailSender: EmailSender,
  private val referralService: ReferralService,
  private val hmppsAuthService: HMPPSAuthService,
  private val userTypeChecker: UserTypeChecker,
  private val communityAPIOffenderService: CommunityAPIOffenderService,
) : ApplicationListener<CreateCaseNoteEvent>, NotifyService {
  companion object : KLogging()

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: CreateCaseNoteEvent) {
    referralService.getSentReferralForUser(event.referralId, event.sentBy)?.let { referral ->
      emailAssignedCaseWorker(referral, event.sentBy, event.caseNoteId)
      emailResponsibleProbationPractitioner(referral, event.sentBy, event.caseNoteId)
    } ?: run {
      throw RuntimeException("Unable to retrieve referral for id ${event.referralId}")
    }
  }

  private fun emailResponsibleProbationPractitioner(referral: Referral, sender: AuthUser, caseNoteId: UUID) {
    val responsibleOfficer = referralService.getResponsibleProbationPractitioner(referral)
    val senderIsResponsibleOfficer =
      userTypeChecker.isProbationPractitionerUser(sender) &&
        (
          (responsibleOfficer.authUser?.let { it == sender } ?: false) ||
            (
              responsibleOfficer.deliusStaffId?.let { it == communityAPIOffenderService.getStaffIdentifier(sender) }
                ?: false // if the RO doesn't have a staff ID we cannot determine if they are the sender, so assume not
              )
          )

    // if the case note was sent by someone other than the RO, email the RO
    if (!senderIsResponsibleOfficer) {
      logger.info("Sending email to ${responsibleOfficer.firstName}")
      emailSender.sendEmail(
        sentTemplate,
        responsibleOfficer.email,
        mapOf(
          "recipientFirstName" to responsibleOfficer.firstName,
          "referralReference" to referral.referenceNumber!!,
          "caseNoteUrl" to generateResourceUrl(interventionsUIBaseURL, ppCaseNoteLocation, caseNoteId).toString(),
        )
      )
    }
  }

  private fun emailAssignedCaseWorker(referral: Referral, sender: AuthUser, caseNoteId: UUID) {
    referral.currentAssignee?.let { assignee ->
      logger.info("Current assignee is $assignee")
      val senderIsAssignee = sender == assignee

      // if the case note was sent by someone other than the assignee, email the assignee
      if (!senderIsAssignee) {
        val assigneeDetails = hmppsAuthService.getUserDetail(assignee)

        logger.info("Sending email to ${assigneeDetails.firstName}")

        emailSender.sendEmail(
          sentTemplate,
          assigneeDetails.email,
          mapOf(
            "recipientFirstName" to assigneeDetails.firstName,
            "referralReference" to referral.referenceNumber!!,
            "caseNoteUrl" to generateResourceUrl(interventionsUIBaseURL, spCaseNoteLocation, caseNoteId).toString(),
          )
        )
      }
    } ?: logger.warn("referral is unassigned; cannot notify case worker about case note creation")
  }
}
