package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.SNSPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.EndOfServiceReportFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID

internal class SNSEndOfServiceReportServiceTest {
  private val publisher = mock<SNSPublisher>()
  private val snsEndOfServiceReportService = SNSEndOfServiceReportService(publisher)

  private val endOfServiceReportFactory = EndOfServiceReportFactory()
  private val authUserFactory = AuthUserFactory()
  private val referral = ReferralFactory().createSent(id = UUID.fromString("56b40f96-0657-4e01-925c-da208a6fbcfd"))
  private val now = OffsetDateTime.now()
  private val user = authUserFactory.create()

  private val endOfServiceReportEvent = EndOfServiceReportEvent(
    "source",
    EndOfServiceReportEventType.SUBMITTED,
    endOfServiceReportFactory.create(
      referral = referral,
      submittedAt = now,
      submittedBy = user,
    ),
    "http://localhost/sent-referral/123/supplier-assessment"
  )

  @Test
  fun `publishes message on end of service report submit`() {
    snsEndOfServiceReportService.onApplicationEvent(endOfServiceReportEvent)

    val referralId = UUID.fromString("56b40f96-0657-4e01-925c-da208a6fbcfd")
    val eventDTO = EventDTO(
      eventType = "intervention.end-of-service-report.submitted",
      description = "An end of service report has been submitted",
      detailUrl = "http://localhost/sent-referral/123/supplier-assessment",
      occurredAt = now,
      additionalInformation = mapOf(
        "endOfServiceReportId" to endOfServiceReportEvent.endOfServiceReport.id,
        "submittedBy" to endOfServiceReportEvent.endOfServiceReport.submittedBy!!.userName,
      ),
    )

    verify(publisher).publish(referralId, user, eventDTO)
  }
}
