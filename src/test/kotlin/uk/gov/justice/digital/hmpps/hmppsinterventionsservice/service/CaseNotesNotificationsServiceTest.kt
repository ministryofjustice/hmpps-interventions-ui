package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserTypeChecker
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.EmailSender
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.CreateCaseNoteEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.CaseNoteFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID

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

    val sender = authUserFactory.createSP(id = "sp_sender", userName = "sp_user_name")
    val referral = referralFactory.createAssigned()
    val caseNote = caseNoteFactory.create(referral = referral, sentBy = sender, subject = "from sp", body = "body")
    whenever(referralService.getSentReferralForUser(referral.id, sender)).thenReturn(referral)
    val eventRequiringSPNotification = CreateCaseNoteEvent(
      "source",
      caseNote.id,
      caseNote.sentBy,
      "detailUrl",
      referral.id
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
    whenever(referralService.getSentReferralForUser(referral.id, sender)).thenReturn(referral)
    val eventRequiringSPNotification = CreateCaseNoteEvent(
      "source",
      caseNote.id,
      caseNote.sentBy,
      "detailUrl",
      referral.id
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
    whenever(referralService.getSentReferralForUser(referral.id, sender)).thenReturn(referral)
    val eventRequiringSPNotification = CreateCaseNoteEvent(
      "source",
      caseNote.id,
      caseNote.sentBy,
      "detailUrl",
      referral.id
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
    whenever(referralService.getSentReferralForUser(referral.id, sender)).thenReturn(referral)
    val eventRequiringSPNotification = CreateCaseNoteEvent(
      "source",
      caseNote.id,
      caseNote.sentBy,
      "detailUrl",
      referral.id
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

  // This is not a normal scenario. Has only arisen as hmpps-auth has returned the same user with
  // two different ids and now username is used in checking if two authUser records represent the same
  // user
  @Test
  fun `SP (assignee) does not get notified as the assignee has the same user name as the sender`() {
    whenever(hmppsAuthService.getUserDetail(any())).thenReturn(UserDetail("sp", "sp@provider.co.uk"))
    val responsiblePp = authUserFactory.createSP(id = "responsiblePp", userName = "sameUserName")
    whenever(referralService.getResponsibleProbationPractitioner(any())).thenReturn(
      ResponsibleProbationPractitioner("pp", "pp@justice.gov.uk", null, responsiblePp)
    )

    val assignedToId = authUserFactory.createSP(id = "sp_assignedToId", userName = "sameUserName")
    val referral = referralFactory.createAssigned(assignments = listOf(ReferralAssignment(OffsetDateTime.now(), assignedToId, assignedToId)))

    val sender = authUserFactory.createSP(id = "sp_sender", userName = "sameUserName")
    val caseNote = caseNoteFactory.create(referral = referral, sentBy = sender, subject = "from sp", body = "body")
    whenever(referralService.getSentReferralForUser(referral.id, sender)).thenReturn(referral)
    val eventRequiringSPNotification = CreateCaseNoteEvent(
      "source",
      caseNote.id,
      caseNote.sentBy,
      "detailUrl",
      referral.id
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
    whenever(referralService.getSentReferralForUser(caseNote.referral.id, sender)).thenReturn(caseNote.referral)
    val event = CreateCaseNoteEvent(
      "source",
      caseNote.id,
      caseNote.sentBy,
      "detailUrl",
      caseNote.referral.id
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

  @Test
  fun `exception thrown if no referral found`() {
    val sender = authUserFactory.createPP(id = "sender")
    val caseNote = caseNoteFactory.create(sentBy = sender, subject = "from pp", body = "body")
    whenever(referralService.getSentReferralForUser(any(), any())).thenReturn(null)
    val event = CreateCaseNoteEvent(
      "source",
      caseNote.id,
      caseNote.sentBy,
      "detailUrl",
      UUID.fromString("e5274827-fcbc-4891-a68b-d9b4d3b59dab")
    )
    var e = assertThrows<RuntimeException> { caseNotesNotificationsService.onApplicationEvent(event) }
    Assertions.assertThat(e.message).contains("Unable to retrieve referral for id e5274827-fcbc-4891-a68b-d9b4d3b59dab")
  }
}
