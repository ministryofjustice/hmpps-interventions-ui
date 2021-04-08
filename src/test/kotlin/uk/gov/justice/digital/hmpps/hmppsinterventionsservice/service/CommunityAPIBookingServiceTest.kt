package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
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
  private val apiUrl = "/appt/{CRN}/{sentenceId}"
  private val crsOfficeLocation = "CRSSHEF"
  private val crsBookingsContext = "CRS"

  private val communityAPIClient: CommunityAPIClient = mock()

  private val communityAPIBookingService = CommunityAPIBookingService(
    true,
    httpBaseUrl,
    viewUrl,
    apiUrl,
    crsOfficeLocation,
    crsBookingsContext,
    communityAPIClient
  )

  @Test
  fun `requests booking for an appointment when timings specified`() {
    val now = now()
    val appointment = makeAppointment(null, null)

    val uri = "/appt/X1/123"
    val link = "http://url/view/${appointment.actionPlan.referral.id}"
    val request = AppointmentCreateRequestDTO(now.toLocalDate(), now.toLocalTime(), now.toLocalTime().plusMinutes(60), "CRSSHEF", notes = link, "CRS")
    val response = AppointmentCreateResponseDTO(1234L)

    whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentCreateResponseDTO::class.java))
      .thenReturn(response)

    communityAPIBookingService.book(appointment, now, 60)

    verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentCreateResponseDTO::class.java)
  }

  @Test
  fun `does nothing if not initial booking`() {
    communityAPIBookingService.book(makeAppointment(null, null), now(), null)
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
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(null, null), null, null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(now(), null), null, null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(null, 60), null, null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(now(), 60), null, null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(null, null), now(), null)).isFalse()
    assertThat(communityAPIBookingService.isInitialBooking(makeAppointment(null, null), now(), 60)).isTrue()
  }

  @Test
  fun `does nothing if not enabled`() {
    val appointment = makeAppointment(null, null)

    val communityAPIBookingServiceNotEnabled = CommunityAPIBookingService(
      false,
      httpBaseUrl,
      viewUrl,
      apiUrl,
      crsOfficeLocation,
      crsBookingsContext,
      communityAPIClient
    )

    communityAPIBookingServiceNotEnabled.book(appointment, now(), 60)
    verifyZeroInteractions(communityAPIClient)
  }

  private fun makeAppointment(appointmentTime: OffsetDateTime?, durationInMinutes: Int?): ActionPlanAppointment {
    val referral = SampleData.sampleReferral(crn = crn, relevantSentenceId = sentenceId, serviceProviderName = "SPN")
    return SampleData.sampleActionPlanAppointment(
      actionPlan = SampleData.sampleActionPlan(referral = referral),
      createdBy = SampleData.sampleAuthUser(),
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes
    )
  }
}
