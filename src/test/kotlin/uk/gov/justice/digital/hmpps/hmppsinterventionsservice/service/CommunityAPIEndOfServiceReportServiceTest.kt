package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.EndOfServiceReportEventType.SUBMITTED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIEndOfServiceReportServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  private val sentAtDefault = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 1, ZoneOffset.UTC)
  private val submittedAtDefault = OffsetDateTime.of(2020, 2, 2, 2, 2, 2, 2, ZoneOffset.UTC)

  val communityAPIService = CommunityAPIEndOfServiceReportEventService(
    "http://testUrl",
    "/probation-practitioner/end-of-service-report/{id}",
    "/secure/offenders/crn/{crn}/sentence/{sentenceId}/notifications/context/{contextName}",
    "commissioned-rehabilitation-services",
    communityAPIClient
  )

  @Test
  fun `notify submitted end of service report`() {

    communityAPIService.onApplicationEvent(getEvent(SUBMITTED))

    verify(communityAPIClient).makeAsyncPostRequest(
      "/secure/offenders/crn/X123456/sentence/1234/notifications/context/commissioned-rehabilitation-services",
      NotificationCreateRequestDTO(
        "ACC",
        sentAtDefault,
        submittedAtDefault,
        "End of Service Report for Referral null has been submitted\n" +
          "Prime Provider is Harmony Living for Contract Type Accommodation\n" +
          "http://testUrl/probation-practitioner/end-of-service-report/120b1a45-8ac7-4920-b05b-acecccf4734b",
      )
    )
  }

  private fun getEvent(
    endOfServiceReportEventType: EndOfServiceReportEventType
  ): EndOfServiceReportEvent =
    EndOfServiceReportEvent(
      "source",
      endOfServiceReportEventType,
      SampleData.sampleEndOfServiceReport(
        id = UUID.fromString("120b1a45-8ac7-4920-b05b-acecccf4734b"),
        submittedAt = submittedAtDefault,
        referral = SampleData.sampleReferral(
          crn = "X123456",
          relevantSentenceId = 1234L,
          serviceProviderName = "Harmony Living",
          sentAt = sentAtDefault,
        ),
      ),
      "http://localhost:8080/end-of-service-report/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"
    )
}
