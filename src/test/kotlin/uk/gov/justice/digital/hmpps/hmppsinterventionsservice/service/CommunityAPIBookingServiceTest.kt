package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.verifyNoMoreInteractions
import com.nhaarman.mockitokotlin2.verifyZeroInteractions
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.component.CommunityAPIClient
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType.SERVICE_DELIVERY
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.LATE
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.NO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.YES
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ServiceProvider
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentDeliveryFactory
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
  private val appointmentDeliveryFactory = AppointmentDeliveryFactory()

  private val referral = referralFactory.createSent(
    serviceUserCRN = "X1",
    relevantSentenceId = 123L,
    referenceNumber = "XX123456",
    intervention = interventionFactory.create(
      contract = dynamicFrameworkContractFactory.create(primeProvider = ServiceProvider("SPN", "SPN"))
    )
  )

  private val httpBaseUrl = "http://url"
  private val progressUrl = "/pp/{referralId}/progress"
  private val supplierAssessmentUrl = "/pp/{referralId}/supplier-assessment"
  private val bookingApiUrl = "/appt/{CRN}/{sentenceId}/{contextName}"
  private val rescheduleApiUrl = "/appt/{CRN}/{sentenceId}/{contextName}/reschedule"
  private val relocateApiUrl = "/appt/{CRN}/{sentenceId}/relocate"
  private val crsOfficeLocation = "CRSEXTL"
  private val crsBookingsContext = "CRS"

  private val communityAPIClient: CommunityAPIClient = mock()

  private val communityAPIBookingService = CommunityAPIBookingService(
    true,
    httpBaseUrl,
    progressUrl,
    supplierAssessmentUrl,
    bookingApiUrl,
    rescheduleApiUrl,
    relocateApiUrl,
    crsOfficeLocation,
    mapOf(AppointmentType.SERVICE_DELIVERY to "Service Delivery"),
    mapOf(AppointmentType.SERVICE_DELIVERY to true),
    crsBookingsContext,
    communityAPIClient
  )

  @Nested
  inner class BookingAppointment {

    @Test
    fun `requests booking for a new appointment`() {
      val now = now()

      val uri = "/appt/X1/123/CRS"
      val notes = "Service Delivery Appointment for Accommodation Referral XX123456 with Prime Provider SPN\n" +
        "http://url/pp/${referral.id}/progress"
      val request = AppointmentCreateRequestDTO(
        "ACC",
        referral.sentAt!!,
        referral.id,
        now.plusMinutes(60),
        now.plusMinutes(120),
        "CRS0001",
        notes = notes,
        true,
        null,
        null
      )
      val response = AppointmentResponseDTO(1234L)

      whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
        .thenReturn(response)

      val deliusAppointmentId = communityAPIBookingService.book(referral, null, now.plusMinutes(60), 60, SERVICE_DELIVERY, "CRS0001", null, null)

      assertThat(deliusAppointmentId).isEqualTo(1234L)
      verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
    }

    @Test
    fun `requests booking for a new appointment with a office location uses default`() {
      val now = now()

      val uri = "/appt/X1/123/CRS"
      val notes = "Service Delivery Appointment for Accommodation Referral XX123456 with Prime Provider SPN\n" +
        "http://url/pp/${referral.id}/progress"
      val request = AppointmentCreateRequestDTO(
        "ACC",
        referral.sentAt!!,
        referral.id,
        now.plusMinutes(60),
        now.plusMinutes(120),
        "CRSEXTL",
        notes = notes,
        true,
        null,
        null
      )
      val response = AppointmentResponseDTO(1234L)

      whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
        .thenReturn(response)

      val deliusAppointmentId = communityAPIBookingService.book(referral, null, now.plusMinutes(60), 60, SERVICE_DELIVERY, null, null, null)

      assertThat(deliusAppointmentId).isEqualTo(1234L)
      verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
    }

    @Test
    fun `requests booking for a new historic appointment with attendance and behaviour`() {
      val now = now()

      val uri = "/appt/X1/123/CRS"
      val notes = "Service Delivery Appointment for Accommodation Referral XX123456 with Prime Provider SPN\n" +
        "http://url/pp/${referral.id}/progress"
      val request = AppointmentCreateRequestDTO(
        "ACC",
        referral.sentAt!!,
        referral.id,
        now.plusMinutes(60),
        now.plusMinutes(120),
        "CRSEXTL",
        notes = notes,
        true,
        "YES",
        true
      )
      val response = AppointmentResponseDTO(1234L)

      whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
        .thenReturn(response)

      val deliusAppointmentId = communityAPIBookingService.book(referral, null, now.plusMinutes(60), 60, SERVICE_DELIVERY, null, YES, true)

      assertThat(deliusAppointmentId).isEqualTo(1234L)
      verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
    }

    @Test
    fun `requests booking for a new historic appointment with non attendance resulting notifying the PP`() {
      val now = now()

      val uri = "/appt/X1/123/CRS"
      val notes = "Service Delivery Appointment for Accommodation Referral XX123456 with Prime Provider SPN\n" +
        "http://url/pp/${referral.id}/progress"
      val request = AppointmentCreateRequestDTO(
        "ACC",
        referral.sentAt!!,
        referral.id,
        now.plusMinutes(60),
        now.plusMinutes(120),
        "CRSEXTL",
        notes = notes,
        true,
        "NO",
        true
      )
      val response = AppointmentResponseDTO(1234L)

      whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
        .thenReturn(response)

      val deliusAppointmentId = communityAPIBookingService.book(referral, null, now.plusMinutes(60), 60, SERVICE_DELIVERY, null, NO, null)

      assertThat(deliusAppointmentId).isEqualTo(1234L)
      verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
    }

    @Test
    fun `set notify PP if PoP does not attend`() {
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(NO, null)).isTrue
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(NO, false)).isTrue
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(NO, true)).isTrue
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(YES, null)).isNull()
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(YES, false)).isFalse
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(YES, true)).isTrue
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(LATE, null)).isNull()
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(LATE, false)).isFalse
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(LATE, true)).isTrue
      assertThat(communityAPIBookingService.setNotifyPPIfAttendedNo(null, null)).isNull()
    }
  }

  @Nested
  inner class ReschedulingAppointment {

    @Test
    fun `requests rescheduling an appointment when timings are different`() {
      val now = now()
      val deliusAppointmentId = 999L
      val appointment = makeAppointment(now, now.plusDays(1), 60, deliusAppointmentId)

      val uri = "/appt/X1/999/CRS/reschedule"
      val request = AppointmentRescheduleRequestDTO(now, now.plusMinutes(45), true, crsOfficeLocation)
      val response = AppointmentResponseDTO(1234L)

      whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
        .thenReturn(response)

      communityAPIBookingService.book(referral, appointment, now, 45, SERVICE_DELIVERY, null, null, null)

      verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
    }

    @Test
    fun `requests rescheduling an appointment when timings are different and location is different`() {
      val now = now()
      val deliusAppointmentId = 999L
      val existingAppointment = makeAppointment(now, now, 60, deliusAppointmentId)
      val appointmentDelivery = appointmentDeliveryFactory.create(existingAppointment.id, npsOfficeCode = "OLD_CODE", appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE)
      existingAppointment.appointmentDelivery = appointmentDelivery

      val uri = "/appt/X1/999/CRS/reschedule"
      val request = AppointmentRescheduleRequestDTO(now, now.plusMinutes(45), true, "NEW_CODE")
      val response = AppointmentResponseDTO(1234L)

      whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
        .thenReturn(response)

      communityAPIBookingService.book(referral, existingAppointment, now, 45, SERVICE_DELIVERY, "NEW_CODE", null, null)

      verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
    }

    @Test
    fun `does not reschedule an appointment when timings are same`() {
      val now = now()
      val deliusAppointmentId = 999L
      val appointment = makeAppointment(now, now.plusDays(1), 60, deliusAppointmentId)

      communityAPIBookingService.book(referral, appointment, now.plusDays(1), 60, SERVICE_DELIVERY, null, null, null)

      verifyNoMoreInteractions(communityAPIClient)
    }

    @Test
    fun `is reschedule`() {
      val referralStart = now()
      val appointmentStart = referralStart.plusDays(1)
      assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 60), appointmentStart, 60, null)).isFalse
      assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 59), appointmentStart, 60, null)).isTrue
      assertThat(communityAPIBookingService.isRescheduleBooking(makeAppointment(referralStart, appointmentStart, 60), appointmentStart.plusNanos(1), 60, null)).isTrue
    }

    @Test
    fun `does not reschedule or relocate an appointment when locations and timings are the same`() {
      val now = now()
      val deliusAppointmentId = 999L
      val existingAppointment = makeAppointment(now, now.plusDays(1), 60, deliusAppointmentId)
      val appointmentDelivery = appointmentDeliveryFactory.create(existingAppointment.id, npsOfficeCode = "NPS_CODE", appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE)
      existingAppointment.appointmentDelivery = appointmentDelivery

      communityAPIBookingService.book(referral, existingAppointment, now.plusDays(1), 60, SERVICE_DELIVERY, "NPS_CODE", null, null)

      verifyNoMoreInteractions(communityAPIClient)
    }

    @Nested
    inner class AppointmentLocationRescheduling {
      @Test
      fun `requests relocation of an appointment when locations are different`() {
        val now = now()
        val deliusAppointmentId = 999L
        val existingAppointment = makeAppointment(now, now, 60, deliusAppointmentId)
        val appointmentDelivery = appointmentDeliveryFactory.create(existingAppointment.id, npsOfficeCode = "OLD_CODE", appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE)
        existingAppointment.appointmentDelivery = appointmentDelivery

        val uri = "/appt/X1/999/relocate"
        val request = AppointmentRelocateRequestDTO("NEW_CODE")
        val response = AppointmentResponseDTO(1234L)

        whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
          .thenReturn(response)

        communityAPIBookingService.book(referral, existingAppointment, now, 60, SERVICE_DELIVERY, "NEW_CODE", null, null)

        verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
      }

      @Test
      fun `requests relocation of an appointment when location is not set on existing appointment `() {
        val now = now()
        val deliusAppointmentId = 999L
        val existingAppointment = makeAppointment(now, now, 60, deliusAppointmentId)
        val appointmentDelivery = appointmentDeliveryFactory.create(existingAppointment.id, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL)
        existingAppointment.appointmentDelivery = appointmentDelivery

        val uri = "/appt/X1/999/relocate"
        val request = AppointmentRelocateRequestDTO("NEW_CODE")
        val response = AppointmentResponseDTO(1234L)

        whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
          .thenReturn(response)

        communityAPIBookingService.book(referral, existingAppointment, now, 60, SERVICE_DELIVERY, "NEW_CODE", null, null)

        verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
      }

      @Test
      fun `requests relocation of an appointment when location is not set on new appointment `() {
        val now = now()
        val deliusAppointmentId = 999L
        val existingAppointment = makeAppointment(now, now, 60, deliusAppointmentId)
        val appointmentDelivery = appointmentDeliveryFactory.create(existingAppointment.id, npsOfficeCode = "OLD_CODE", appointmentDeliveryType = AppointmentDeliveryType.IN_PERSON_MEETING_PROBATION_OFFICE)
        existingAppointment.appointmentDelivery = appointmentDelivery

        val uri = "/appt/X1/999/relocate"
        val request = AppointmentRelocateRequestDTO(crsOfficeLocation)
        val response = AppointmentResponseDTO(1234L)

        whenever(communityAPIClient.makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java))
          .thenReturn(response)

        communityAPIBookingService.book(referral, existingAppointment, now, 60, SERVICE_DELIVERY, crsOfficeLocation, null, null)

        verify(communityAPIClient).makeSyncPostRequest(uri, request, AppointmentResponseDTO::class.java)
      }

      @Test
      fun `does not relocate an appointment when no location is provided and also the existing appointment does not have location set`() {
        val now = now()
        val deliusAppointmentId = 999L
        val existingAppointment = makeAppointment(now, now, 60, deliusAppointmentId)
        val appointmentDelivery = appointmentDeliveryFactory.create(existingAppointment.id, appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL)
        existingAppointment.appointmentDelivery = appointmentDelivery

        communityAPIBookingService.book(referral, existingAppointment, now, 60, SERVICE_DELIVERY, null, null, null)

        verifyNoMoreInteractions(communityAPIClient)
      }
    }
  }

  @Test
  fun `does nothing if not enabled`() {
    val appointment = makeAppointment(now(), now(), 60)

    val communityAPIBookingServiceNotEnabled = CommunityAPIBookingService(
      false,
      httpBaseUrl,
      progressUrl,
      supplierAssessmentUrl,
      bookingApiUrl,
      rescheduleApiUrl,
      relocateApiUrl,
      crsOfficeLocation,
      mapOf(),
      mapOf(),
      crsBookingsContext,
      communityAPIClient
    )

    val deliusAppointmentId = communityAPIBookingServiceNotEnabled.book(referral, appointment, now(), 60, SERVICE_DELIVERY, null, null, null)

    assertThat(deliusAppointmentId).isNull()
    verifyZeroInteractions(communityAPIClient)
  }

  @Test
  fun `does nothing if not enabled and returns supplied id for existing delius appointment`() {
    val appointment = makeAppointment(now(), now(), 60, 1234L)

    val communityAPIBookingServiceNotEnabled = CommunityAPIBookingService(
      false,
      httpBaseUrl,
      progressUrl,
      supplierAssessmentUrl,
      bookingApiUrl,
      relocateApiUrl,
      rescheduleApiUrl,
      crsOfficeLocation,
      mapOf(),
      mapOf(),
      crsBookingsContext,
      communityAPIClient
    )

    val deliusAppointmentId = communityAPIBookingServiceNotEnabled.book(referral, appointment, now(), 60, SERVICE_DELIVERY, null, null, null)

    assertThat(deliusAppointmentId).isEqualTo(1234L)
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
