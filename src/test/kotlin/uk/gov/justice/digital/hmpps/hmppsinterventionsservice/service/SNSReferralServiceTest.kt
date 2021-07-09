package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.SNSPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ReferralAssignment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID

internal class SNSReferralServiceTest {
  private val snsPublisher = mock<SNSPublisher>()
  private val referralFactory = ReferralFactory()
  private val authUserFactory = AuthUserFactory()

  private val referralSentEvent = ReferralEvent(
    "source",
    ReferralEventType.SENT,
    referralFactory.createSent(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
      sentAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
      sentBy = AuthUser("ecd7b8d690", "irrelevant", "irrelevant"),
    ),
    "http://localhost:8080/sent-referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"
  )

  private val referralAssignedEvent = ReferralEvent(
    "source",
    ReferralEventType.ASSIGNED,
    referralFactory.createSent(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
      assignments = listOf(
        ReferralAssignment(
          OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
          authUserFactory.createSP("irrelevant"),
          authUserFactory.createSP("abc123")
        )
      )
    ),
    "http://localhost:8080/sent-referral/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"
  )

  @Test
  fun `referral sent event publishes message`() {
    snsReferralService().onApplicationEvent(referralSentEvent)
    val snsEvent = EventDTO(
      "intervention.referral.sent",
      "A referral has been sent to a Service Provider",
      "http://localhost:8080" + "/sent-referral/${referralSentEvent.referral.id}",
      referralSentEvent.referral.sentAt!!,
      mapOf("referralId" to UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"))
    )
    verify(snsPublisher).publish(referralSentEvent.referral.id, referralSentEvent.referral.sentBy!!, snsEvent)
  }

  @Test
  fun `referral assigned event publishes message with valid json`() {
    snsReferralService().onApplicationEvent(referralAssignedEvent)
    val snsEvent = EventDTO(
      "intervention.referral.assigned",
      "A referral has been assigned to a caseworker / service provider",
      "http://localhost:8080" + "/sent-referral/${referralSentEvent.referral.id}",
      referralSentEvent.referral.sentAt!!,
      mapOf("referralId" to UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"), "assignedTo" to "abc123")
    )
    verify(snsPublisher).publish(
      referralAssignedEvent.referral.id,
      referralAssignedEvent.referral.currentAssignment!!.assignedBy,
      snsEvent
    )
  }

  private fun snsReferralService(): SNSReferralService {
    return SNSReferralService(snsPublisher)
  }
}
