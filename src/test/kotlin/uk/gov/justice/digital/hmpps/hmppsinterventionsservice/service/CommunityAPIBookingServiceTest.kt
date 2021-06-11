package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyNoMoreInteractions
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DynamicFrameworkContractFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.InterventionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.time.OffsetDateTime.now

internal class CommunityAPIBookingServiceTest {
  private val referralFactory = ReferralFactory()
  private val interventionFactory = InterventionFactory()
  private val dynamicFrameworkContractFactory = DynamicFrameworkContractFactory()
  private val appointmentFactory = AppointmentFactory()

  private val referral = referralFactory.createSent(
    serviceUserCRN = "X1",
    relevantSentenceId = 123L,
    referenceNumber = "XX123456",
    intervention = interventionFactory.create(
      contract = dynamicFrameworkContractFactory.create(primeProvider = ServiceProvider("SPN", "SPN", ""))
    )
  )

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
  fun `requests booking for a new appointment`() {
    val now = OffsetDateTime.now()

    val uri = "/appt/X1/123/CRS"
    val notes = "Appointment for Accommodation Referral XX123456 with Prime Provider SPN\n" +
      "http://url/view/${referral.id}"
    val request = AppointmentCreateRequestDTO(
      "ACC",
      referral.sentAt!!,
      referral.id,
      now.plusMinutes(60),
      now.plusMinutes(120),
      "CRSEXTL",
      notes = notes,
      true
    )
    val response = AppointmentResponseDTO(1234L)

    whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
      .thenReturn(response)

    val deliusAppointmentId = communityAPIBookingService.book(referral, null, now.plusMinutes(60), 60)

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

    communityAPIBookingService.book(referral, appointment, now, 45)

    verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
  }

  @Test
  fun `does not reschedule an appointment when timings are same`() {
    val now = now()
    val deliusAppointmentId = 999L
    val appointment = makeAppointment(now, now.plusDays(1), 60, deliusAppointmentId)

    communityAPIBookingService.book(referral, appointment, now.plusDays(1), 60)

    verifyNoMoreInteractions(communityAPIClient)
  }

  @Test
  fun `is reschedule`() {
    val referralStart = now()
    val appointmentStart = referralStart.plusDays(1)
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 60), appointmentStart, 60)).isFalse
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 59), appointmentStart, 60)).isTrue
    assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 60), appointmentStart.plusNanos(1), 60)).isTrue
  }

  @Test
  fun `does nothing if not enabled`() {
    val appointment = makeAppointment(now(), now(), 60)

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

    communityAPIBookingServiceNotEnabled.book(referral, appointment, now(), 60)
    verifyZeroInteractions(communityAPIClient)
  }

  private fun makeAppointment(createdAt: OffsetDateTime, appointmentTime: OffsetDateTime, durationInMinutes: Int, deliusAppointmentId: Long? = null): Appointment {
    return appointmentFactory.create(
      createdAt = createdAt,
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = deliusAppointmentId,
    )
  }
}
