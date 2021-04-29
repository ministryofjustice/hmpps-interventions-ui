package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.fasterxml.jackson.databind.node.BooleanNode
import com.fasterxml.jackson.databind.node.TextNode
import com.github.fge.jackson.jsonpointer.JsonPointer
import com.github.fge.jsonpatch.JsonPatch
import com.github.fge.jsonpatch.ReplaceOperation
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType.SESSION_FEEDBACK_RECORDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.LATE
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.util.UUID

class CommunityAPIAppointmentServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  @Test
  fun `got service successfully`() {

    val communityAPIService = CommunityAPIAppointmentEventService(
      "http://baseUrl",
      "/probation-practitioner/action-plan/{id}/appointment/{sessionNumber}/post-session-feedback",
      "/secure/offenders/crn/{crn}/appointments/{appointmentId}/context/{contextName}",
      "commissioned-rehabilitation-services",
      communityAPIClient
    )

    communityAPIService.onApplicationEvent(appointmentEvent)

    val urlCaptor = argumentCaptor<String>()
    val payloadCaptor = argumentCaptor<Any>()
    val referralId = appointmentEvent.appointment.actionPlan.referral.id
    verify(communityAPIClient).makeAsyncPatchRequest(urlCaptor.capture(), payloadCaptor.capture())
    assertThat(urlCaptor.firstValue).isEqualTo("/secure/offenders/crn/CRN123/appointments/123456/context/commissioned-rehabilitation-services")
    assertThat(payloadCaptor.firstValue.toString()).isEqualTo(
      JsonPatch(
        listOf(
          ReplaceOperation(JsonPointer.of("notes"), TextNode.valueOf("http://baseUrl/probation-practitioner/action-plan/$referralId/appointment/1/post-session-feedback")),
          ReplaceOperation(JsonPointer.of("attended"), TextNode.valueOf("LATE")),
          ReplaceOperation(JsonPointer.of("notifyPPOfAttendanceBehaviour"), BooleanNode.valueOf(true))
        )
      ).toString()
    )
  }

  private val appointmentEvent = AppointmentEvent(
    "source",
    SESSION_FEEDBACK_RECORDED,
    SampleData.sampleActionPlanAppointment(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      actionPlan = SampleData.sampleActionPlan(),
      sessionNumber = 1,
      appointmentTime = OffsetDateTime.now(),
      durationInMinutes = 60,
      createdBy = SampleData.sampleAuthUser("userId", "auth", "me"),
      attended = LATE,
      additionalAttendanceInformation = "dded notes",
      attendanceSubmittedAt = OffsetDateTime.now(),
      notifyPPOfAttendanceBehaviour = true,
      deliusAppointmentId = 123456L
    ),
    "http://localhost:8080/url/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
    true
  )
}
