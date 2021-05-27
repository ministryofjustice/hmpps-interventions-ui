package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyNoMoreInteractions
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SampleData
import java.time.OffsetDateTime
import java.time.OffsetDateTime.now

internal class CommunityAPIBookingServiceTest {

  private val crn = "X1"
  private val sentenceId = 123L

  private val httpBaseUrl = "http://url"
  private val viewUrl = "/view/{referralId}"
  private val bookingApiUrl = "/appt/{CRN}/{sentenceId}/{contextName}"
  private val rescheduleApiUrl = "/appt/{CRN}/{sentenceId}/{contextName}/reschedule"
  private val crsOfficeLocation = "CRSEXTL"
  private val crsBookingsContext = "CRS"

  private val communityAPIClient: CommunityAPIClient = mock()

  private val communityAPIBookingService = CommunityAPIBookingService(
    true,
    httpBaseUrl,
    viewUrl,
    bookingApiUrl,
    rescheduleApiUrl,
    crsOfficeLocation,
    crsBookingsContext,
    communityAPIClient
  )

  @Test
  fun `requests booking for an appointment when timings specified`() {
    val now = OffsetDateTime.now()
    val appointment = makeAppointment(now, null, null)

    val uri = "/appt/X1/123/CRS"
    val notes = "Appointment for Accommodation Referral XX123456 with Prime Provider SPN\n" +
      "http://url/view/${appointment.actionPlan.referral.id}"
    val request = AppointmentCreateRequestDTO(
      "ACC",
      now,
      appointment.actionPlan.referral.id,
      now.plusMinutes(60),
      now.plusMinutes(120),
      "CRSEXTL",
      notes = notes,
      true
    )
    val response = AppointmentResponseDTO(1234L)

    whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
      .thenReturn(response)

    val deliusAppointmentId = communityAPIBookingService.book(appointment, now.plusMinutes(60), 60)

    assertThat(deliusAppointmentId).isEqualTo(1234L)
    verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
  }

  @Test
  fun `requests rescheduling an appointment when timings are different`() {
    val now = now()
    val deliusAppointmentId = 999L
    val appointment = makeAppointment(now, now.plusDays(1), 60, deliusAppointmentId)

    val uri = "/appt/X1/999/CRS/reschedule"
    val request = AppointmentRescheduleRequestDTO(now, now.plusMinutes(45), true)
    val response = AppointmentResponseDTO(1234L)

    whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
      .thenReturn(response)

    communityAPIBookingService.book(appointment, now, 45)

    verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
  }

  @Test
  fun `does not reschedule an appointment when timings are same`() {
    val now = now()
    val deliusAppointmentId = 999L
    val appointment = makeAppointment(now, now.plusDays(1), 60, deliusAppointmentId)

    communityAPIBookingService.book(appointment, now.plusDays(1), 60)

    verifyNoMoreInteractions(communityAPIClient)
  }

  @Test
  fun `does nothing if not initial booking`() {
    val deliusAppointmentId = communityAPIBookingService.book(makeAppointment(now(), null, null), now(), null)

    assertThat(deliusAppointmentId).isNull()
    verifyZeroInteractions(communityAPIClient)
  }

  @Test
  fun `is timing specified`() {
    assertThat(communityAPIBookingService.isTimingSpecified(null, null)).isFalse()
    assertThat(communityAPIBookingService.isTimingSpecified(now(), null)).isFalse()
    assertThat(communityAPIBookingService.isTimingSpecified(null, 60)).isFalse()
    assertThat(communityAPIBookingService.isTimingSpecified(now(), 60)).isTrue()
  }

  @Test
  fun `is initial booking`() {
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(now(), null, null), null, null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(now(), now(), null), null, null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(now(), null, 60), null, null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(now(), now(), 60), null, null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(now(), null, null), now(), null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(now(), null, null), now(), 60)).isTrue()
  }

  @Test
  fun `is reschedule`() {
    val referralStart = now()
    val appointmentStart = referralStart.plusDays(1)
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, null, null), null, null)).isFalse()
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, null), null, null)).isFalse()
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, null, 60), null, null)).isFalse()
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 60), null, null)).isFalse()
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, null, null), appointmentStart, null)).isFalse()
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, null, null), appointmentStart, 60)).isFalse()
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 60), appointmentStart, 60)).isFalse()
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 59), appointmentStart, 60)).isTrue()
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 60), appointmentStart.plusNanos(1), 60)).isTrue()
  }

  @Test
  fun `does nothing if not enabled`() {
    val appointment = makeAppointment(now(), null, null)

    val communityAPIBookingServiceNotEnabled = CommunityAPIBookingService(
      false,
      httpBaseUrl,
      viewUrl,
      bookingApiUrl,
      rescheduleApiUrl,
      crsOfficeLocation,
      crsBookingsContext,
      communityAPIClient
    )

    communityAPIBookingServiceNotEnabled.book(appointment, now(), 60)
    verifyZeroInteractions(communityAPIClient)
  }

  private fun makeAppointment(sentAt: OffsetDateTime, appointmentTime: OffsetDateTime?, durationInMinutes: Int?, deliusAppointmentId: Long? = null): ActionPlanAppointment {
    val referral = SampleData.sampleReferral(crn = crn, relevantSentenceId = sentenceId, sentAt = sentAt, serviceProviderName = "SPN", referenceNumber = "XX123456")
    return SampleData.sampleActionPlanAppointment(
      actionPlan = SampleData.sampleActionPlan(referral = referral),
      createdBy = SampleData.sampleAuthUser(),
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = deliusAppointmentId
    )
  }
}
