package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.inOrder
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIReferralEventServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  private val sentAtDefault = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 1, ZoneOffset.UTC)
  private val concludedAtDefault = OffsetDateTime.of(2020, 2, 2, 2, 2, 2, 2, ZoneOffset.UTC)
  private val submittedAtDefault = OffsetDateTime.of(2020, 3, 3, 3, 3, 3, 3, ZoneOffset.UTC)

  private val communityAPIService = CommunityAPIReferralEventService(
    "http://testUrl",
    "/pp/referral/{id}",
    "/pp/referral/{id}/end-of-service-report",
    "secure/offenders/crn/{crn}/referral/end/context/{contextName}",
    "secure/offenders/crn/{crn}/sentence/{sentenceId}/notifications/context/{contextName}",
    "commissioned-rehabilitation-services",
    communityAPIClient
  )

  @Test
  fun `does not notify sent referral`() {

    val event = getEvent(ReferralEventType.SENT)
    communityAPIService.onApplicationEvent(event)

    verifyZeroInteractions(communityAPIClient)
  }

  @Test
  fun `notify cancelled referral`() {

    val event = getEvent(ReferralEventType.CANCELLED, concludedAtDefault)
    communityAPIService.onApplicationEvent(event)

    verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/end/context/commissioned-rehabilitation-services",
      ReferralEndRequest(
        "ACC",
        sentAtDefault,
        concludedAtDefault,
        123456789,
        event.referral.id,
        "CANCELLED",
        "Referral Ended for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/pp/referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
      )
    )
  }

  @Test
  fun `notify prematurely ended referral`() {

    val event = getEvent(ReferralEventType.PREMATURELY_ENDED, concludedAtDefault, endOfServiceReport)
    communityAPIService.onApplicationEvent(event)

    val inOrder = inOrder(communityAPIClient)

    inOrder.verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/sentence/123456789/notifications/context/commissioned-rehabilitation-services",
      NotificationCreateRequestDTO(
        "ACC",
        sentAtDefault,
        event.referral.id,
        submittedAtDefault,
        "End of Service Report Submitted for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/pp/referral/120b1a45-8ac7-4920-b05b-acecccf4734b/end-of-service-report",
      )
    )

    inOrder.verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/end/context/commissioned-rehabilitation-services",
      ReferralEndRequest(
        "ACC",
        sentAtDefault,
        concludedAtDefault,
        123456789,
        event.referral.id,
        "PREMATURELY_ENDED",
        "Referral Ended for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/pp/referral/120b1a45-8ac7-4920-b05b-acecccf4734b/end-of-service-report",
      )
    )
  }

  @Test
  fun `notify prematurely ended throws exception when no end of service report exists`() {

    val event = getEvent(ReferralEventType.PREMATURELY_ENDED, concludedAtDefault)
    assertThrows<IllegalStateException> { communityAPIService.onApplicationEvent(event) }
  }

  @Test
  fun `notify completed referral`() {

    val event = getEvent(ReferralEventType.COMPLETED, concludedAtDefault, endOfServiceReport)
    communityAPIService.onApplicationEvent(event)

    val inOrder = inOrder(communityAPIClient)

    inOrder.verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/sentence/123456789/notifications/context/commissioned-rehabilitation-services",
      NotificationCreateRequestDTO(
        "ACC",
        sentAtDefault,
        event.referral.id,
        submittedAtDefault,
        "End of Service Report Submitted for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/pp/referral/120b1a45-8ac7-4920-b05b-acecccf4734b/end-of-service-report",
      )
    )

    inOrder.verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/end/context/commissioned-rehabilitation-services",
      ReferralEndRequest(
        "ACC",
        sentAtDefault,
        concludedAtDefault,
        123456789,
        event.referral.id,
        "COMPLETED",
        "Referral Ended for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/pp/referral/120b1a45-8ac7-4920-b05b-acecccf4734b/end-of-service-report",
      )
    )
  }

  @Test
  fun `notify cancelled referral throws exception when no end of service report exists`() {

    val event = getEvent(ReferralEventType.COMPLETED, concludedAtDefault)
    assertThrows<IllegalStateException> { communityAPIService.onApplicationEvent(event) }
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
      referral = SampleData.sampleReferral(
        id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
        referenceNumber = "HAS71263",
        crn = "X123456",
        relevantSentenceId = 123456789,
        serviceProviderName = "Harmony Living",
        sentAt = sentAtDefault,
        concludedAt = concludedAtDefault
      ),
      submittedAt = submittedAtDefault
    )
}
