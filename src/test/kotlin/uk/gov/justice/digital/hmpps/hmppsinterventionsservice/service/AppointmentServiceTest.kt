package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.atLeast
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentType.SUPPLIER_ASSESSMENT
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended.NO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentDeliveryRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import java.time.OffsetDateTime
import java.util.UUID
import java.util.Optional.empty
import java.util.Optional.of
import javax.persistence.EntityNotFoundException

class AppointmentServiceTest {
  private val authUserRepository: AuthUserRepository = mock()
  private val appointmentRepository: AppointmentRepository = mock()
  private val communityAPIBookingService: CommunityAPIBookingService = mock()
  private val appointmentDeliveryRepository: AppointmentDeliveryRepository = mock()

  private val authUserFactory = AuthUserFactory()
  private val appointmentFactory = AppointmentFactory()
  private val referralFactory = ReferralFactory()

  private val createdByUser = authUserFactory.create()

  private val appointmentService = AppointmentService(
    appointmentRepository,
    communityAPIBookingService,
    appointmentDeliveryRepository,
    authUserRepository,
  )

  @BeforeEach
  fun beforeEach() {
    whenever(authUserRepository.save(any())).thenReturn(createdByUser)
  }

  @Test
  fun `create new appointment if none currently exist`() {
    // Given
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val referral = referralFactory.createSent()
    val deliusAppointmentId = 99L

    whenever(communityAPIBookingService.book(referral, null, appointmentTime, durationInMinutes, SUPPLIER_ASSESSMENT))
      .thenReturn(deliusAppointmentId)
    val savedAppointment = appointmentFactory.create(
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = deliusAppointmentId,
    )
    whenever(appointmentRepository.save(any())).thenReturn(savedAppointment)

    // When
    val newAppointment = appointmentService.createOrUpdateAppointment(referral, null, durationInMinutes, appointmentTime, SUPPLIER_ASSESSMENT, createdByUser, AppointmentDeliveryType.PHONE_CALL)

    // Then
    verifyResponse(newAppointment, null, true, deliusAppointmentId, appointmentTime, durationInMinutes, AppointmentDeliveryType.PHONE_CALL)
    verifySavedAppointment(appointmentTime, durationInMinutes, deliusAppointmentId, AppointmentDeliveryType.PHONE_CALL)
  }

  @Test
  fun `appointment without attendance data can be updated`() {
    // Given
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val existingAppointment = appointmentFactory.create(deliusAppointmentId = 98L, attended = null)
    val referral = referralFactory.createSent()
    val rescheduledDeliusAppointmentId = 99L

    whenever(communityAPIBookingService.book(referral, existingAppointment, appointmentTime, durationInMinutes, SUPPLIER_ASSESSMENT))
      .thenReturn(rescheduledDeliusAppointmentId)
    val savedAppointment = appointmentFactory.create(
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = rescheduledDeliusAppointmentId,
    )
    whenever(appointmentRepository.save(any())).thenReturn(savedAppointment)

    // When
    val updatedAppointment = appointmentService.createOrUpdateAppointment(referral, existingAppointment, durationInMinutes, appointmentTime, SUPPLIER_ASSESSMENT, createdByUser, AppointmentDeliveryType.PHONE_CALL)

    // Then
    verifyResponse(updatedAppointment, existingAppointment.id, false, rescheduledDeliusAppointmentId, appointmentTime, durationInMinutes, AppointmentDeliveryType.PHONE_CALL)
    verifySavedAppointment(appointmentTime, durationInMinutes, rescheduledDeliusAppointmentId, AppointmentDeliveryType.PHONE_CALL)
  }

  @Test
  fun `appointment with none attendance will create a new appointment`() {
    // Given
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val existingAppointment = appointmentFactory.create(deliusAppointmentId = 98L, attended = NO)
    val referral = referralFactory.createSent()
    val additionalDeliusAppointmentId = 99L

    whenever(communityAPIBookingService.book(referral, null, appointmentTime, durationInMinutes, SUPPLIER_ASSESSMENT)).thenReturn(additionalDeliusAppointmentId)
    val savedAppointment = appointmentFactory.create(
      appointmentTime = appointmentTime,
      durationInMinutes = durationInMinutes,
      deliusAppointmentId = additionalDeliusAppointmentId,
    )
    whenever(appointmentRepository.save(any())).thenReturn(savedAppointment)

    // When
    val newAppointment = appointmentService.createOrUpdateAppointment(referral, existingAppointment, durationInMinutes, appointmentTime, SUPPLIER_ASSESSMENT, createdByUser, AppointmentDeliveryType.PHONE_CALL)

    // Then
    verifyResponse(newAppointment, existingAppointment.id, true, additionalDeliusAppointmentId, appointmentTime, durationInMinutes, AppointmentDeliveryType.PHONE_CALL)
    verifySavedAppointment(appointmentTime, durationInMinutes, additionalDeliusAppointmentId, AppointmentDeliveryType.PHONE_CALL)
  }

  @Test
  fun `any other scenario will throw an error`() {
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val createdByUser = authUserFactory.create()
    val appointment = appointmentFactory.create(attended = Attended.YES)
    val referral = referralFactory.createSent()

    val error = assertThrows<IllegalStateException> {
      appointmentService.createOrUpdateAppointment(referral, appointment, durationInMinutes, appointmentTime, SUPPLIER_ASSESSMENT, createdByUser, AppointmentDeliveryType.PHONE_CALL)
    }
    assertThat(error.message).contains("Is it not possible to update an appointment that has already been attended")
  }

  private fun verifyResponse(appointment: Appointment, originalId: UUID?, expectNewId: Boolean, deliusAppointmentId: Long, appointmentTime: OffsetDateTime?, durationInMinutes: Int, appointmentDeliveryType: AppointmentDeliveryType) {

    // Verifying create or update route
    if (expectNewId)
      assertThat(appointment).isNotEqualTo(originalId)
    else
      assertThat(appointment).isNotEqualTo(originalId)

    assertThat(appointment.deliusAppointmentId).isEqualTo(deliusAppointmentId)
    assertThat(appointment.appointmentTime).isEqualTo(appointmentTime)
    assertThat(appointment.durationInMinutes).isEqualTo(durationInMinutes)
    assertThat(appointment.appointmentDelivery?.appointmentDeliveryType).isEqualTo(appointmentDeliveryType)
  }

  private fun verifySavedAppointment(appointmentTime: OffsetDateTime, durationInMinutes: Int, deliusAppointmentId: Long, appointmentDeliveryType: AppointmentDeliveryType) {
    val argumentCaptor = argumentCaptor<Appointment>()
    verify(appointmentRepository, atLeast(1)).saveAndFlush(argumentCaptor.capture())
    val arguments = argumentCaptor.lastValue

    assertThat(arguments.id).isNotNull
    assertThat(arguments.appointmentTime).isEqualTo(appointmentTime)
    assertThat(arguments.durationInMinutes).isEqualTo(durationInMinutes)
    assertThat(arguments.deliusAppointmentId).isEqualTo(deliusAppointmentId)
    assertThat(arguments.appointmentDelivery?.appointmentDeliveryType).isEqualTo(appointmentDeliveryType)
  }

  @Test
  fun `appointment behaviour can be updated`() {
    val appointmentId = UUID.randomUUID()
    val behaviourDescription = "description"
    val notifyProbationPractitioner = true
    val appointment = appointmentFactory.create(id = appointmentId)
    val submittedBy = authUserFactory.create()

    whenever(appointmentRepository.findById(appointmentId)).thenReturn(of(appointment))
    whenever(appointmentRepository.save(any())).thenReturn(appointment)
    whenever(authUserRepository.save(any())).thenReturn(submittedBy)

    appointmentService.recordBehaviour(appointmentId, behaviourDescription, notifyProbationPractitioner, submittedBy)

    val argumentCaptor = argumentCaptor<Appointment>()
    verify(appointmentRepository, times(1)).save(argumentCaptor.capture())
    val arguments = argumentCaptor.firstValue

    assertThat(arguments.id).isEqualTo(appointmentId)
    assertThat(arguments.attendanceBehaviour).isEqualTo(behaviourDescription)
    assertThat(arguments.notifyPPOfAttendanceBehaviour).isEqualTo(notifyProbationPractitioner)
    assertThat(arguments.attendanceBehaviourSubmittedAt).isNotNull
    assertThat(arguments.attendanceBehaviourSubmittedBy).isEqualTo(submittedBy)
  }

  @Test
  fun `appointment behaviour cannot be updated if feedback has been submitted`() {
    val appointmentId = UUID.randomUUID()
    val behaviourDescription = "description"
    val notifyProbationPractitioner = true
    val submittedBy = authUserFactory.create()
    val feedbackSubmittedAt = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val appointment = appointmentFactory.create(id = appointmentId, appointmentFeedbackSubmittedAt = feedbackSubmittedAt)

    whenever(appointmentRepository.findById(appointmentId)).thenReturn(of(appointment))

    val error = assertThrows<ResponseStatusException> {
      appointmentService.recordBehaviour(appointmentId, behaviourDescription, notifyProbationPractitioner, submittedBy)
    }
    assertThat(error.message).contains("Feedback has already been submitted for this appointment [id=$appointmentId]")
  }

  @Test
  fun `appointment behaviour cannot be updated if appointment cannot be found`() {
    val appointmentId = UUID.randomUUID()
    val behaviourDescription = "description"
    val notifyProbationPractitioner = true
    val submittedBy = authUserFactory.create()
    val appointment = appointmentFactory.create(id = appointmentId)

    whenever(appointmentRepository.findById(appointmentId)).thenReturn(of(appointment))
    whenever(appointmentRepository.findById(appointmentId)).thenReturn(empty())

    val error = assertThrows<EntityNotFoundException> {
      appointmentService.recordBehaviour(appointmentId, behaviourDescription, notifyProbationPractitioner, submittedBy)
    }
    assertThat(error.message).contains("Appointment not found [id=$appointmentId]")
  }
}
