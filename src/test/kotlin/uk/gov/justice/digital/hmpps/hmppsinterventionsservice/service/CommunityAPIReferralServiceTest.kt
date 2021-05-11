package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIReferralServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  @Test
  fun `got service successfully`() {

    val communityAPIService = CommunityAPIReferralEventService(
      "http://testUrl",
      "secure/offenders/crn/{id}/referral/sent",
      "secure/offenders/crn/{crn}/referral/start/context/{contextName}",
      "commissioned-rehabilitation-services",
      communityAPIClient
    )

    communityAPIService.onApplicationEvent(referralSentEvent)

    verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/start/context/commissioned-rehabilitation-services",
      ReferRequest(
        "ACC",
        OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 1, ZoneOffset.UTC),
        123456789,
        "http://testUrl/secure/offenders/crn/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080/referral/sent",
      )
    )
  }

  private val referralSentEvent = ReferralEvent(
    "source",
    ReferralEventType.SENT,
    SampleData.sampleReferral(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
      crn = "X123456",
      relevantSentenceId = 123456789,
      serviceProviderName = "Harmony Living",
      sentAt = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 1, ZoneOffset.UTC)
    ),
    "http://localhost:8080/sent-referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"
  )
}
