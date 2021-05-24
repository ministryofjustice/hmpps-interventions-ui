package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIReferralServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  private val sentAtDefault = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 1, ZoneOffset.UTC)
  private val concludedAtDefault = OffsetDateTime.of(2020, 2, 2, 2, 2, 2, 2, ZoneOffset.UTC)

  val communityAPIService = CommunityAPIReferralEventService(
    "http://testUrl",
    "/referral/sent/{id}",
    "/referral/progress/{id}",
    "/referral/end-of-service-report/{id}",
    "secure/offenders/crn/{crn}/referral/start/context/{contextName}",
    "secure/offenders/crn/{crn}/referral/end/context/{contextName}",
    "commissioned-rehabilitation-services",
    communityAPIClient
  )

  @Test
  fun `notify sent referral`() {

    communityAPIService.onApplicationEvent(getEvent(ReferralEventType.SENT))

    verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/start/context/commissioned-rehabilitation-services",
      ReferRequest(
        "ACC",
        sentAtDefault,
        123456789,
        "Referral Sent for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/referral/sent/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
      )
    )
  }

  @Test
  fun `notify cancelled referral`() {

    communityAPIService.onApplicationEvent(getEvent(ReferralEventType.CANCELLED, concludedAtDefault))

    verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/end/context/commissioned-rehabilitation-services",
      ReferralEndRequest(
        "ACC",
        sentAtDefault,
        concludedAtDefault,
        123456789,
        "CANCELLED",
        "Referral Ended for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/referral/progress/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
      )
    )
  }

  @Test
  fun `notify prematurely ended referral`() {

    communityAPIService.onApplicationEvent(getEvent(ReferralEventType.PREMATURELY_ENDED, concludedAtDefault, endOfServiceReport))

    verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/end/context/commissioned-rehabilitation-services",
      ReferralEndRequest(
        "ACC",
        sentAtDefault,
        concludedAtDefault,
        123456789,
        "PREMATURELY_ENDED",
        "Referral Ended for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/referral/end-of-service-report/120b1a45-8ac7-4920-b05b-acecccf4734b",
      )
    )
  }

  @Test
  fun `notify completed referral`() {

    communityAPIService.onApplicationEvent(getEvent(ReferralEventType.COMPLETED, concludedAtDefault, endOfServiceReport))

    verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/end/context/commissioned-rehabilitation-services",
      ReferralEndRequest(
        "ACC",
        sentAtDefault,
        concludedAtDefault,
        123456789,
        "COMPLETED",
        "Referral Ended for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/referral/end-of-service-report/120b1a45-8ac7-4920-b05b-acecccf4734b",
      )
    )
  }

  private fun getEvent(
    referralEventType: ReferralEventType,
    concludedAt: OffsetDateTime? = null,
    endOfServiceReport: EndOfServiceReport? = null
  ): ReferralEvent =
    ReferralEvent(
      "source",
      referralEventType,
      SampleData.sampleReferral(
        id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
        referenceNumber = "HAS71263",
        crn = "X123456",
        relevantSentenceId = 123456789,
        serviceProviderName = "Harmony Living",
        sentAt = sentAtDefault,
        concludedAt = concludedAt,
        endOfServiceReport = endOfServiceReport,
      ),
      "http://localhost:8080/sent-referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"
    )

  private val endOfServiceReport =
    SampleData.sampleEndOfServiceReport(
      id = UUID.fromString("120b1a45-8ac7-4920-b05b-acecccf4734b"),
      referral = SampleData.sampleReferral(crn = "X123456", serviceProviderName = "Harmony Living"),
    )
}
