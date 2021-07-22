package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType.SESSION_FEEDBACK_RECORDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType.SUPPLIER_ASSESSMENT
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.LATE
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import java.time.OffsetDateTime
import java.util.UUID

class CommunityAPIAppointmentEventServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  private val appointmentFactory = AppointmentFactory()

  @Test
  fun `got service successfully`() {

    val communityAPIService = CommunityAPIAppointmentEventService(
      "http://baseUrl",
      "/probation-practitioner/referrals/{id}/supplier-assessment/post-session-feedback",
      "/secure/offenders/crn/{crn}/appointments/{appointmentId}/outcome/context/{contextName}",
      "commissioned-rehabilitation-services",
      communityAPIClient
    )
    appointmentEvent.appointment.referral.referenceNumber = "X123456"

    communityAPIService.onApplicationEvent(appointmentEvent)

    val urlCaptor = argumentCaptor<String>()
    val payloadCaptor = argumentCaptor<Any>()
    verify(communityAPIClient).makeAsyncPostRequest(urlCaptor.capture(), payloadCaptor.capture())
    assertThat(urlCaptor.firstValue).isEqualTo("/secure/offenders/crn/CRN123/appointments/123456/outcome/context/commissioned-rehabilitation-services")
    assertThat(payloadCaptor.firstValue.toString()).isEqualTo(
      AppointmentOutcomeRequest(
        "Session Feedback Recorded for Accommodation Referral X123456 with Prime Provider TOP Service Provider\n" +
          "http://baseUrl/probation-practitioner/referrals/356d0712-5266-4d18-9070-058244873f2c/supplier-assessment/post-session-feedback",
        "LATE",
        true
      ).toString()
    )
  }

  private val appointmentEvent = AppointmentEvent(
    "source",
    SESSION_FEEDBACK_RECORDED,
    appointmentFactory.create(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referral = SampleData.sampleReferral("CRN123", "TOP Service Provider", UUID.fromString("356d0712-5266-4d18-9070-058244873f2c")),
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
    true,
    SUPPLIER_ASSESSMENT
  )
}
