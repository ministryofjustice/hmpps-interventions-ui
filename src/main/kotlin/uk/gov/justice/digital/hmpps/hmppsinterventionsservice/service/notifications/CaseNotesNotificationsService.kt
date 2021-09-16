package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import mu.KLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.ApplicationListener
import org.springframework.stereotype.Service
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.CaseNoteEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.CaseNoteEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.exception.AsyncEventExceptionHandling
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.CaseNote

@Service
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
  private val caseNoteService: CaseNoteService,
) : ApplicationListener<CaseNoteEvent>, NotifyService {
  companion object : KLogging()

  @AsyncEventExceptionHandling
  override fun onApplicationEvent(event: CaseNoteEvent) {
    when (event.type) {
      CaseNoteEventType.SENT -> {
        // get case note from repository because the linking objects (referral.currentAssignee) on the caseNote from the event
        // may sometimes not be lazy loaded because the session may already have been closed by this point
        caseNoteService.getCaseNoteById(event.caseNote.id)?.let { caseNote ->
          emailAssignedCaseWorker(caseNote)
          emailResponsibleProbationPractitioner(caseNote)
        } ?: run {
          throw RuntimeException("Unable to retrieve case note for id ${event.caseNote.id}")
        }
      }
    }
  }

  private fun emailResponsibleProbationPractitioner(caseNote: CaseNote) {
    val sender = caseNote.sentBy
    val responsibleOfficer = referralService.getResponsibleProbationPractitioner(caseNote.referral)
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
      emailSender.sendEmail(
        sentTemplate,
        responsibleOfficer.email,
        mapOf(
          "recipientFirstName" to responsibleOfficer.firstName,
          "referralReference" to caseNote.referral.referenceNumber!!,
          "caseNoteUrl" to generateResourceUrl(interventionsUIBaseURL, ppCaseNoteLocation, caseNote.id).toString(),
        )
      )
    }
  }

  private fun emailAssignedCaseWorker(caseNote: CaseNote) {
    caseNote.referral.currentAssignee?.let { assignee ->
      val senderIsAssignee = caseNote.sentBy == assignee

      // if the case note was sent by someone other than the assignee, email the assignee
      if (!senderIsAssignee) {
        val assigneeDetails = hmppsAuthService.getUserDetail(assignee)

        emailSender.sendEmail(
          sentTemplate,
          assigneeDetails.email,
          mapOf(
            "recipientFirstName" to assigneeDetails.firstName,
            "referralReference" to caseNote.referral.referenceNumber!!,
            "caseNoteUrl" to generateResourceUrl(interventionsUIBaseURL, spCaseNoteLocation, caseNote.id).toString(),
          )
        )
      }
    } ?: logger.warn("referral is unassigned; cannot notify case worker about case note creation")
  }
}
