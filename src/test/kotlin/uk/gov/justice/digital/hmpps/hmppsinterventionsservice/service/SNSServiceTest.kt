package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.SNSPublisher
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.EventDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ReferralEventType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AuthUser
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.util.UUID

internal class SNSServiceTest {
  private val snsPublisher = mock<SNSPublisher>()

  private val referralSentEvent = ReferralEvent(
    "source",
    ReferralEventType.SENT,
    SampleData.sampleReferral(
      "X123456",
      "Harmony Living",
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
      sentAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
    ),
  )

  private val referralAssignedEvent = ReferralEvent(
    "source",
    ReferralEventType.ASSIGNED,
    SampleData.sampleReferral(
      "X123456",
      "Harmony Living",
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referenceNumber = "HAS71263",
      assignedTo = AuthUser("abc123", "auth", "abc123"),
      assignedAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00"),
    ),
  )

  private fun snsService(): SNSService {
    return SNSService(snsPublisher, "http://localhost:8080", "/sent-referral/{id}")
  }

  @Test
  fun `referral sent event publishes message`() {
    snsService().onApplicationEvent(referralSentEvent)
    val snsEvent = EventDTO(
      "intervention.referral.sent",
      "A referral has been sent to a Service Provider",
      "http://localhost:8080" + "/sent-referral/${referralSentEvent.referral.id}",
      referralSentEvent.referral.sentAt!!,
      1,
      mapOf("referralId" to UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"))
    )
    verify(snsPublisher).publish(snsEvent)
  }

  @Test
  fun `referral assigned event publishes message with valid json`() {
    snsService().onApplicationEvent(referralAssignedEvent)
    val snsEvent = EventDTO(
      "intervention.referral.assigned",
      "A referral has been assigned to a service user",
      "http://localhost:8080" + "/sent-referral/${referralSentEvent.referral.id}",
      referralSentEvent.referral.sentAt!!,
      1,
      mapOf("referralId" to UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"), "assignedTo" to "abc123")
    )
  }
}
