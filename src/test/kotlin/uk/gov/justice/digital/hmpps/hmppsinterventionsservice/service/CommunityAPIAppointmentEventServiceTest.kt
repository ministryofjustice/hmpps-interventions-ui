package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.AppointmentEventType.SESSION_FEEDBACK_RECORDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType.SUPPLIER_ASSESSMENT
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.LATE
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.NO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.YES
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import java.time.OffsetDateTime
import java.util.UUID

class CommunityAPIAppointmentEventServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  private val appointmentFactory = AppointmentFactory()

  private val communityAPIService = CommunityAPIAppointmentEventService(
    "http://baseUrl",
    "/probation-practitioner/referrals/{id}/supplier-assessment/post-session-feedback",
    true,
    "/secure/offenders/crn/{crn}/appointments/{appointmentId}/outcome/context/{contextName}",
    "commissioned-rehabilitation-services",
    communityAPIClient
  )

  @Test
  fun `notifies community-api of late attended appointment outcome`() {

    appointmentEvent.appointment.attended = LATE
    appointmentEvent.appointment.notifyPPOfAttendanceBehaviour = false

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyNotification(LATE.name, false)
  }

  @Test
  fun `notifies community-api of attended appointment outcome`() {

    appointmentEvent.appointment.attended = YES
    appointmentEvent.appointment.notifyPPOfAttendanceBehaviour = false

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyNotification(YES.name, false)
  }

  @Test
  fun `notifies community-api of non attended appointment outcome and notify PP set is always set`() {

    appointmentEvent.appointment.attended = NO
    appointmentEvent.appointment.notifyPPOfAttendanceBehaviour = false

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyNotification(NO.name, true)
  }

  @Test
  fun `notifies community-api of appointment outcome with notify PP set`() {

    appointmentEvent.appointment.attended = YES
    appointmentEvent.appointment.notifyPPOfAttendanceBehaviour = true

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyNotification(YES.name, true)
  }

  @Test
  fun `does not notify when not enabled`() {

    val communityAPIService = CommunityAPIAppointmentEventService(
      "http://baseUrl",
      "/probation-practitioner/referrals/{id}/supplier-assessment/post-session-feedback",
      false,
      "/secure/offenders/crn/{crn}/appointments/{appointmentId}/outcome/context/{contextName}",
      "commissioned-rehabilitation-services",
      communityAPIClient
    )

    appointmentEvent.appointment.attended = YES
    appointmentEvent.appointment.notifyPPOfAttendanceBehaviour = true

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyZeroInteractions(communityAPIClient)
  }

  private fun verifyNotification(attended: String, notifyPP: Boolean) {
    val urlCaptor = argumentCaptor<String>()
    val payloadCaptor = argumentCaptor<Any>()
    verify(communityAPIClient).makeAsyncPostRequest(urlCaptor.capture(), payloadCaptor.capture())
    assertThat(urlCaptor.firstValue).isEqualTo("/secure/offenders/crn/CRN123/appointments/123456/outcome/context/commissioned-rehabilitation-services")
    assertThat(payloadCaptor.firstValue.toString()).isEqualTo(
      AppointmentOutcomeRequest(
        "Session Feedback Recorded for Accommodation Referral X123456 with Prime Provider TOP Service Provider\n" +
          "http://baseUrl/probation-practitioner/referrals/356d0712-5266-4d18-9070-058244873f2c/supplier-assessment/post-session-feedback",
        attended,
        notifyPP
      ).toString()
    )
  }

  private val appointmentEvent = AppointmentEvent(
    "source",
    SESSION_FEEDBACK_RECORDED,
    appointmentFactory.create(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referral = SampleData.sampleReferral("CRN123", "TOP Service Provider", UUID.fromString("356d0712-5266-4d18-9070-058244873f2c"), "X123456"),
      appointmentTime = OffsetDateTime.now(),
      durationInMinutes = 60,
      createdBy = SampleData.sampleAuthUser("userId", "auth", "me"),
      additionalAttendanceInformation = "dded notes",
      attendanceSubmittedAt = OffsetDateTime.now(),
      deliusAppointmentId = 123456L
    ),
    "http://localhost:8080/url/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
    true,
    SUPPLIER_ASSESSMENT
  )
}
