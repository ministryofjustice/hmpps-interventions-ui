package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEvent
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.events.ActionPlanAppointmentEventType.SESSION_FEEDBACK_RECORDED
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.LATE
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.NO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.YES
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ActionPlanFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID

class CommunityAPIActionPlanAppointmentEventServiceTest {

  private val communityAPIClient = mock<CommunityAPIClient>()

  private val deliverySessionFactory = DeliverySessionFactory()
  private val referralFactory = ReferralFactory()
  private val actionPlanFactory = ActionPlanFactory()

  private val communityAPIService = CommunityAPIActionPlanAppointmentEventService(
    "http://baseUrl",
    "/probation-practitioner/referrals/{id}/appointment/{sessionNumber}/post-session-feedback",
    true,
    "/secure/offenders/crn/{crn}/appointments/{appointmentId}/outcome/context/{contextName}",
    "commissioned-rehabilitation-services",
    communityAPIClient
  )

  @Test
  fun `notifies community-api of late attended appointment outcome`() {

    appointmentEvent.deliverySession.referral.referenceNumber = "X123456"
    appointmentEvent.deliverySession.currentAppointment!!.attended = LATE
    appointmentEvent.deliverySession.currentAppointment!!.notifyPPOfAttendanceBehaviour = false

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyNotification(LATE.name, false)
  }

  @Test
  fun `notifies community-api of attended appointment outcome`() {

    appointmentEvent.deliverySession.referral.referenceNumber = "X123456"
    appointmentEvent.deliverySession.currentAppointment!!.attended = YES
    appointmentEvent.deliverySession.currentAppointment!!.notifyPPOfAttendanceBehaviour = false

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyNotification(YES.name, false)
  }

  @Test
  fun `notifies community-api of non attended appointment outcome and notify PP set is always set`() {

    appointmentEvent.deliverySession.referral.referenceNumber = "X123456"
    appointmentEvent.deliverySession.currentAppointment!!.attended = NO
    appointmentEvent.deliverySession.currentAppointment!!.notifyPPOfAttendanceBehaviour = false

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyNotification(NO.name, true)
  }

  @Test
  fun `notifies community-api of appointment outcome with notify PP set`() {

    appointmentEvent.deliverySession.referral.referenceNumber = "X123456"
    appointmentEvent.deliverySession.currentAppointment!!.attended = YES
    appointmentEvent.deliverySession.currentAppointment!!.notifyPPOfAttendanceBehaviour = true

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyNotification(YES.name, true)
  }

  @Test
  fun `does not notify when not enabled`() {

    val communityAPIService = CommunityAPIActionPlanAppointmentEventService(
      "http://baseUrl",
      "/probation-practitioner/referrals/{id}/appointment/{sessionNumber}/post-session-feedback",
      false,
      "/secure/offenders/crn/{crn}/appointments/{appointmentId}/outcome/context/{contextName}",
      "commissioned-rehabilitation-services",
      communityAPIClient
    )

    appointmentEvent.deliverySession.referral.referenceNumber = "X123456"
    appointmentEvent.deliverySession.currentAppointment!!.attended = YES
    appointmentEvent.deliverySession.currentAppointment!!.notifyPPOfAttendanceBehaviour = true

    communityAPIService.onApplicationEvent(appointmentEvent)

    verifyZeroInteractions(communityAPIClient)
  }

  private fun verifyNotification(attended: String, notifyPP: Boolean) {
    val urlCaptor = argumentCaptor<String>()
    val payloadCaptor = argumentCaptor<Any>()
    val referralId = appointmentEvent.deliverySession.referral.id
    verify(communityAPIClient).makeAsyncPostRequest(urlCaptor.capture(), payloadCaptor.capture())
    assertThat(urlCaptor.firstValue).isEqualTo("/secure/offenders/crn/CRN123/appointments/123456/outcome/context/commissioned-rehabilitation-services")
    assertThat(payloadCaptor.firstValue.toString()).isEqualTo(
      AppointmentOutcomeRequest(
        "Session Feedback Recorded for Accommodation Referral X123456 with Prime Provider Harmony Living\n" +
          "http://baseUrl/probation-practitioner/referrals/$referralId/appointment/1/post-session-feedback",
        attended,
        notifyPP
      ).toString()
    )
  }

  private val appointmentEvent = ActionPlanAppointmentEvent(
    "source",
    SESSION_FEEDBACK_RECORDED,
    deliverySessionFactory.createAttended(
      id = UUID.fromString("68df9f6c-3fcb-4ec6-8fcf-96551cd9b080"),
      referral = referralFactory.createSent(serviceUserCRN = "CRN123", actionPlans = mutableListOf(actionPlanFactory.create())),
      sessionNumber = 1,
      appointmentTime = OffsetDateTime.now(),
      durationInMinutes = 60,
      createdBy = SampleData.sampleAuthUser("userId", "auth", "me"),
      additionalAttendanceInformation = "dded notes",
      attendanceSubmittedAt = OffsetDateTime.now(),
      deliusAppointmentId = 123456L
    ),
    "http://localhost:8080/url/68df9f6c-3fcb-4ec6-8fcf-96551cd9b080",
    true
  )
}