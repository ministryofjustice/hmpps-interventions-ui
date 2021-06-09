package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.never
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.EndOfServiceReport
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIReferralServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  private val sentAtDefault = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 1, ZoneOffset.UTC)

  private fun communityAPIReferralServiceFactory(enabled: Boolean) = CommunityAPIReferralService(
    enabled,
    "http://testUrl",
    "/referral/sent/{id}",
    "secure/offenders/crn/{crn}/referral/start/context/{contextName}",
    "commissioned-rehabilitation-services",
    communityAPIClient
  )

  @Test
  fun `does nothing when disabled`() {
    val referral = getReferral()
    communityAPIReferralServiceFactory(false).send(referral)

    verify(communityAPIClient, never()).makeSyncPostRequest<ReferralSentResponseDTO>(any(), any(), any())
  }

  @Test
  fun `Sends referral`() {
    val referral = getReferral()
    communityAPIReferralServiceFactory(true).send(referral)

    verify(communityAPIClient).makeSyncPostRequest(
      "secure/offenders/crn/X123456/referral/start/context/commissioned-rehabilitation-services",
      ReferralSentRequest(
        "ACC",
        sentAtDefault,
        123456789,
        referral.id,
        "Referral Sent for Accommodation Referral HAS71263 with Prime Provider Harmony Living\n" +
          "http://testUrl/referral/sent/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
      ),
      ReferralSentResponseDTO::class.java
    )
  }

  private fun getReferral(
    concludedAt: OffsetDateTime? = null,
    endOfServiceReport: EndOfServiceReport? = null
  ): Referral =
    SampleData.sampleReferral(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
      crn = "X123456",
      relevantSentenceId = 123456789,
      serviceProviderName = "Harmony Living",
      sentAt = sentAtDefault,
      concludedAt = concludedAt,
      endOfServiceReport = endOfServiceReport,
    )
}
