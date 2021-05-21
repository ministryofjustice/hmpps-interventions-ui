package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanEventType.SUBMITTED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.UUID

class CommunityAPIActionPlanServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  private val sentAtDefault = OffsetDateTime.of(2020, 1, 1, 1, 1, 1, 1, ZoneOffset.UTC)
  private val submittedAtDefault = OffsetDateTime.of(2020, 2, 2, 2, 2, 2, 2, ZoneOffset.UTC)

  val communityAPIService = CommunityAPIActionPlanEventService(
    "http://testUrl",
    "/probation-practitioner/submit-action-plan/{id}",
    "/secure/offenders/crn/{crn}/sentence/{sentenceId}/notifications/context/{contextName}",
    "commissioned-rehabilitation-services",
    communityAPIClient
  )

  @Test
  fun `notify submitted action plan`() {

    communityAPIService.onApplicationEvent(getEvent(SUBMITTED))

    verify(communityAPIClient).makeAsyncPostRequest(
      "/secure/offenders/crn/X123456/sentence/1234/notifications/context/commissioned-rehabilitation-services",
      NotificationCreateRequestDTO(
        "ACC",
        sentAtDefault,
        submittedAtDefault,
        "Action Plan Submitted for Accommodation Referral XX1234 with Prime Provider Harmony Living\n" +
          "http://testUrl/probation-practitioner/submit-action-plan/120b1a45-8ac7-4920-b05b-acecccf4734b",
      )
    )
  }

  private fun getEvent(
    ActionPlanEventType: ActionPlanEventType
  ): ActionPlanEvent =
    ActionPlanEvent(
      "source",
      ActionPlanEventType,
      SampleData.sampleActionPlan(
        id = UUID.fromString("120b1a45-8ac7-4920-b05b-acecccf4734b"),
        submittedAt = submittedAtDefault,
        referral = SampleData.sampleReferral(
          crn = "X123456",
          relevantSentenceId = 1234L,
          serviceProviderName = "Harmony Living",
          sentAt = sentAtDefault,
          referenceNumber = "XX1234"
        ),
      ),
      "http://localhost:8080/submit-action-plan/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"
    )
}
