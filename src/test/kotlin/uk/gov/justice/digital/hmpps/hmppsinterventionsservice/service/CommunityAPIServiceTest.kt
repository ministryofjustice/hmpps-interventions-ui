package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  @Test
  fun `got service successfully`() {

    val communityAPIService = CommunityAPIService(
      "http://testUrl",
      "secure/offenders/crn/{id}/referral/sent",
      "secure/offenders/crn/{id}/referral/sent",
      communityAPIClient
    )

    communityAPIService.onApplicationEvent(referralSentEvent)

    verify(communityAPIClient).makeAsyncPostRequest(
      "secure/offenders/crn/X123456/referral/sent",
      ReferRequest(
        "Accommodation",
        123456789,
        "http://testUrl/secure/offenders/crn/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080/referral/sent",
        LocalDate.of(2020, 1, 1)
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
      sentenceId = 123456789,
      serviceProviderName = "Harmony Living",
      sentAt = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 0, ZoneOffset.of("+00:00"))
    ),
    "http://localhost:8080/sent-referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"
  )
}
