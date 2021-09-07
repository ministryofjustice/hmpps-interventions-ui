package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.CaseNoteEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.CaseNoteEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.CaseNoteFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime

internal class CaseNotesNotificationsServiceTest {
  private val referralService = mock<ReferralService>()
  private val emailSender = mock<EmailSender>()
  private val hmppsAuthService = mock<HMPPSAuthService>()
  private val communityAPIOffenderService = mock<CommunityAPIOffenderService>()

  private val caseNotesNotificationsService = CaseNotesNotificationsService(
    "sent-template",
    "https://interventions.gov.uk",
    "/service-provider/case-note/{id}",
    "/probation-practitioner/case-note/{id}",
    emailSender,
    referralService,
    hmppsAuthService,
    UserTypeChecker(),
    communityAPIOffenderService,
  )

  private val authUserFactory = AuthUserFactory()
  private val referralFactory = ReferralFactory()
  private val caseNoteFactory = CaseNoteFactory()

  @Test
  fun `both PPs (responsible officer) and SPs (assignee) get notifications for a sent case note as long as they didn't send it`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("sp", "sp@provider.co.uk"))
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenReturn(
      ResponsibleProbationPractitioner("pp", "pp@justice.gov.uk", null, null)
    )

    val sender = authUserFactory.createSP(id = "sp_sender")
    val referral = referralFactory.createAssigned()
    val caseNote = caseNoteFactory.create(referral = referral, sentBy = sender, subject = "from sp", body = "body")
    val eventRequiringSPNotification = CaseNoteEvent(
      "source",
      CaseNoteEventType.SENT,
      caseNote,
      "detailUrl"
    )

    caseNotesNotificationsService.onApplicationEvent(eventRequiringSPNotification)

    verify(emailSender, times(2)).sendEmail(any(), any(), any())
    verify(emailSender, times(1)).sendEmail(
      "sent-template",
      "sp@provider.co.uk",
      mapOf(
        "recipientFirstName" to "sp",
        "referralReference" to caseNote.referral.referenceNumber!!,
        "caseNoteUrl" to "https://interventions.gov.uk/service-provider/case-note/${caseNote.id}"
      )
    )
    verify(emailSender, times(1)).sendEmail(
      "sent-template",
      "pp@justice.gov.uk",
      mapOf(
        "recipientFirstName" to "pp",
        "referralReference" to caseNote.referral.referenceNumber!!,
        "caseNoteUrl" to "https://interventions.gov.uk/probation-practitioner/case-note/${caseNote.id}"
      )
    )
  }

  @Test
  fun `PP (responsible officer) does not get notified if they sent the case note`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("sp", "sp@provider.co.uk"))
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenReturn(
      ResponsibleProbationPractitioner("pp", "pp@justice.gov.uk", 123L, null)
    )
    whenever(communityAPIOffenderService.getStaffIdentifier(any())).thenReturn(123L)

    val sender = authUserFactory.createPP(id = "pp_sender")
    val referral = referralFactory.createAssigned()
    val caseNote = caseNoteFactory.create(referral = referral, sentBy = sender, subject = "from pp", body = "body")
    val eventRequiringSPNotification = CaseNoteEvent(
      "source",
      CaseNoteEventType.SENT,
      caseNote,
      "detailUrl"
    )

    caseNotesNotificationsService.onApplicationEvent(eventRequiringSPNotification)

    // only called once
    verify(emailSender, times(1)).sendEmail(any(), any(), any())
    // with sp details
    verify(emailSender).sendEmail(
      "sent-template",
      "sp@provider.co.uk",
      mapOf(
        "recipientFirstName" to "sp",
        "referralReference" to caseNote.referral.referenceNumber!!,
        "caseNoteUrl" to "https://interventions.gov.uk/service-provider/case-note/${caseNote.id}"
      )
    )
  }

  @Test
  fun `PP (referring officer) does not get notified if they sent the case note`() {
    val sender = authUserFactory.createPP(id = "pp_sender")

    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("sp", "sp@provider.co.uk"))
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenReturn(
      ResponsibleProbationPractitioner("pp", "pp@justice.gov.uk", null, sender)
    )

    val referral = referralFactory.createAssigned()
    val caseNote = caseNoteFactory.create(referral = referral, sentBy = sender, subject = "from pp", body = "body")
    val eventRequiringSPNotification = CaseNoteEvent(
      "source",
      CaseNoteEventType.SENT,
      caseNote,
      "detailUrl"
    )

    caseNotesNotificationsService.onApplicationEvent(eventRequiringSPNotification)

    // only called once
    verify(emailSender, times(1)).sendEmail(any(), any(), any())
    // with sp details
    verify(emailSender).sendEmail(
      "sent-template",
      "sp@provider.co.uk",
      mapOf(
        "recipientFirstName" to "sp",
        "referralReference" to caseNote.referral.referenceNumber!!,
        "caseNoteUrl" to "https://interventions.gov.uk/service-provider/case-note/${caseNote.id}"
      )
    )
  }

  @Test
  fun `SP (assignee) does not get notified if they sent the case note`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("sp", "sp@provider.co.uk"))
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenReturn(
      ResponsibleProbationPractitioner("pp", "pp@justice.gov.uk", null, null)
    )

    val sender = authUserFactory.createSP(id = "sp_sender")
    val referral = referralFactory.createAssigned(assignments = listOf(ReferralAssignment(OffsetDateTime.now(), sender, sender)))
    val caseNote = caseNoteFactory.create(referral = referral, sentBy = sender, subject = "from sp", body = "body")
    val eventRequiringSPNotification = CaseNoteEvent(
      "source",
      CaseNoteEventType.SENT,
      caseNote,
      "detailUrl"
    )

    caseNotesNotificationsService.onApplicationEvent(eventRequiringSPNotification)

    // only called once
    verify(emailSender, times(1)).sendEmail(any(), any(), any())
    // with pp details
    verify(emailSender).sendEmail(
      "sent-template",
      "pp@justice.gov.uk",
      mapOf(
        "recipientFirstName" to "pp",
        "referralReference" to caseNote.referral.referenceNumber!!,
        "caseNoteUrl" to "https://interventions.gov.uk/probation-practitioner/case-note/${caseNote.id}"
      )
    )
  }

  @Test
  fun `SP (assignee) does not get notified if the referral is unassigned`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("sp", "sp@provider.co.uk"))
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenReturn(
      ResponsibleProbationPractitioner("pp", "pp@justice.gov.uk", null, null)
    )

    val sender = authUserFactory.createPP(id = "sender")
    val caseNote = caseNoteFactory.create(sentBy = sender, subject = "from pp", body = "body")
    val event = CaseNoteEvent(
      "source",
      CaseNoteEventType.SENT,
      caseNote,
      "detailUrl"
    )

    caseNotesNotificationsService.onApplicationEvent(event)

    // only called once
    verify(emailSender, times(1)).sendEmail(any(), any(), any())
    // with pp details
    verify(emailSender).sendEmail(
      "sent-template",
      "pp@justice.gov.uk",
      mapOf(
        "recipientFirstName" to "pp",
        "referralReference" to caseNote.referral.referenceNumber!!,
        "caseNoteUrl" to "https://interventions.gov.uk/probation-practitioner/case-note/${caseNote.id}"
      )
    )
  }
}
