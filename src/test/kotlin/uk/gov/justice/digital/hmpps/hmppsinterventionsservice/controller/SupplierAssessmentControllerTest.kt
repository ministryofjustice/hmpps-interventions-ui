package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.AddressDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.RecordAppointmentBehaviourDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentAttendanceDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.AppointmentDeliveryType
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Attended
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.AppointmentService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.SupplierAssessmentService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.SupplierAssessmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.validator.AppointmentValidator
import java.time.OffsetDateTime
import java.util.UUID

class SupplierAssessmentControllerTest {
  private val userMapper = mock<UserMapper>()
  private val referralService = mock<ReferralService>()
  private val supplierAssessmentService = mock<SupplierAssessmentService>()
  private val appointmentValidator = mock<AppointmentValidator>()
  private val appointmentService = mock<AppointmentService>()

  private val tokenFactory = JwtTokenFactory()
  private val authUserFactory = AuthUserFactory()
  private val referralFactory = ReferralFactory()
  private val supplierAssessmentFactory = SupplierAssessmentFactory()
  private val appointmentFactory = AppointmentFactory()

  private val supplierAssessmentController = SupplierAssessmentController(referralService, supplierAssessmentService, userMapper, appointmentValidator, appointmentService)

  @Test
  fun `update supplier assessment appointment details`() {
    val referral = referralFactory.createSent()
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val appointmentDeliveryType = AppointmentDeliveryType.PHONE_CALL
    val addressDTO = AddressDTO(
      firstAddressLine = "Harmony Living Office, Room 4",
      secondAddressLine = "44 Bouverie Road",
      townOrCity = "Blackpool",
      county = "Lancashire",
      postCode = "SY40RE"
    )
    val update = UpdateAppointmentDTO(appointmentTime, durationInMinutes, appointmentDeliveryType, addressDTO)
    val user = authUserFactory.create()
    val token = tokenFactory.create()
    val supplierAssessment = supplierAssessmentFactory.create()

    whenever(userMapper.fromToken(token)).thenReturn(user)
    whenever(referralService.getSentReferralForUser(referral.id, user)).thenReturn(referral)
    whenever(supplierAssessmentService.getSupplierAssessmentById(any())).thenReturn(supplierAssessment)
    whenever(supplierAssessmentService.createOrUpdateSupplierAssessmentAppointment(supplierAssessment, durationInMinutes, appointmentTime, user, appointmentDeliveryType, addressDTO)).thenReturn(supplierAssessment.currentAppointment)

    val response = supplierAssessmentController.updateSupplierAssessmentAppointment(referral.id, update, token)
    verify(appointmentValidator).validateUpdateAppointment(eq(update))
    assertThat(response).isNotNull
  }

  @Nested
  inner class RecordAppointmentBehaviour {
    @Test
    fun `can record appointment behaviour`() {
      val referralId = UUID.randomUUID()
      val behaviourDescription = "description"
      val notifyProbationPractitioner = true
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      val supplierAssessment = supplierAssessmentFactory.create()
      supplierAssessment.referral.supplierAssessment = supplierAssessment
      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(supplierAssessment.referral)
      whenever(appointmentService.recordBehaviour(eq(supplierAssessment!!.currentAppointment!!), eq(behaviourDescription), eq(notifyProbationPractitioner), eq(submittedBy))).thenReturn(appointmentFactory.create())

      val userRequest = RecordAppointmentBehaviourDTO(behaviourDescription, notifyProbationPractitioner)
      val result = supplierAssessmentController.recordAppointmentBehaviour(referralId, userRequest, token)
      assertThat(result).isNotNull
    }
    @Test
    fun `expect not found if referral does not exist`() {
      val referralId = UUID.randomUUID()
      val behaviourDescription = "description"
      val notifyProbationPractitioner = true
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(null)

      val userRequest = RecordAppointmentBehaviourDTO(behaviourDescription, notifyProbationPractitioner)
      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.recordAppointmentBehaviour(referralId, userRequest, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("referral not found")
    }

    @Test
    fun `expect not found if supplier assessment does not exist`() {
      val referralId = UUID.randomUUID()
      val behaviourDescription = "description"
      val notifyProbationPractitioner = true
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      val referral = referralFactory.createSent(supplierAssessment = null)
      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(referral)

      val userRequest = RecordAppointmentBehaviourDTO(behaviourDescription, notifyProbationPractitioner)
      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.recordAppointmentBehaviour(referralId, userRequest, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("supplier assessment not found for referral")
    }

    @Test
    fun `expect not found if current appointment does not exist`() {
      val referralId = UUID.randomUUID()
      val behaviourDescription = "description"
      val notifyProbationPractitioner = true
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      val supplierAssessment = supplierAssessmentFactory.createWithNoAppointment()
      supplierAssessment.referral.supplierAssessment = supplierAssessment

      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(supplierAssessment.referral)

      val userRequest = RecordAppointmentBehaviourDTO(behaviourDescription, notifyProbationPractitioner)
      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.recordAppointmentBehaviour(referralId, userRequest, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("no current appointment exists on supplier assessment for referral")
    }
  }

  @Nested
  inner class RecordAppointmentAttendance {
    @Test
    fun `can record appointment attendance`() {
      val referralId = UUID.randomUUID()
      val attended = Attended.YES
      val additionalAttendanceInformation = "information"
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      val supplierAssessment = supplierAssessmentFactory.create()
      supplierAssessment.referral.supplierAssessment = supplierAssessment
      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(supplierAssessment.referral)
      whenever(appointmentService.recordAppointmentAttendance(eq(supplierAssessment!!.currentAppointment!!), eq(attended), eq(additionalAttendanceInformation), eq(submittedBy))).thenReturn(appointmentFactory.create())

      val userRequest = UpdateAppointmentAttendanceDTO(attended, additionalAttendanceInformation)
      val result = supplierAssessmentController.recordAttendance(referralId, userRequest, token)
      assertThat(result).isNotNull
    }

    @Test
    fun `expect not found if referral does not exist`() {
      val referralId = UUID.randomUUID()
      val attended = Attended.YES
      val additionalAttendanceInformation = "information"
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(null)

      val userRequest = UpdateAppointmentAttendanceDTO(attended, additionalAttendanceInformation)
      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.recordAttendance(referralId, userRequest, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("referral not found")
    }

    @Test
    fun `expect not found if supplier assessment does not exist`() {
      val referralId = UUID.randomUUID()
      val attended = Attended.YES
      val additionalAttendanceInformation = "information"
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      val referral = referralFactory.createSent(supplierAssessment = null)
      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(referral)

      val userRequest = UpdateAppointmentAttendanceDTO(attended, additionalAttendanceInformation)
      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.recordAttendance(referralId, userRequest, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("supplier assessment not found for referral")
    }

    @Test
    fun `expect not found if current appointment does not exist`() {
      val referralId = UUID.randomUUID()
      val attended = Attended.YES
      val additionalAttendanceInformation = "information"
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      val supplierAssessment = supplierAssessmentFactory.createWithNoAppointment()
      supplierAssessment.referral.supplierAssessment = supplierAssessment

      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(supplierAssessment.referral)

      val userRequest = UpdateAppointmentAttendanceDTO(attended, additionalAttendanceInformation)
      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.recordAttendance(referralId, userRequest, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("no current appointment exists on supplier assessment for referral")
    }
  }

  @Nested
  inner class SubmitFeedback {
    @Test
    fun `can submit appointment feedback`() {
      val referralId = UUID.randomUUID()
      val submittedBy = authUserFactory.create()
      val token = tokenFactory.create()

      val supplierAssessment = supplierAssessmentFactory.create()
      supplierAssessment.referral.supplierAssessment = supplierAssessment
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(supplierAssessment.referral)
      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(appointmentService.submitSessionFeedback(eq(supplierAssessment!!.currentAppointment!!), eq(submittedBy))).thenReturn(appointmentFactory.create())

      val result = supplierAssessmentController.submitFeedback(referralId, token)
      assertThat(result).isNotNull
    }
    @Test
    fun `expect not found if referral does not exist`() {
      val referralId = UUID.randomUUID()
      val submittedBy = authUserFactory.create()
      val token = tokenFactory.create()

      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(null)

      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.submitFeedback(referralId, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("referral not found")
    }

    @Test
    fun `expect not found if supplier assessment does not exist`() {
      val referralId = UUID.randomUUID()
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      val referral = referralFactory.createSent(supplierAssessment = null)
      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(referral)

      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.submitFeedback(referralId, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("supplier assessment not found for referral")
    }

    @Test
    fun `expect not found if current appointment does not exist`() {
      val referralId = UUID.randomUUID()
      val submittedBy = authUserFactory.createSP()
      val token = tokenFactory.create()

      val supplierAssessment = supplierAssessmentFactory.createWithNoAppointment()
      supplierAssessment.referral.supplierAssessment = supplierAssessment

      whenever(userMapper.fromToken(token)).thenReturn(submittedBy)
      whenever(referralService.getSentReferralForUser(eq(referralId), eq(submittedBy))).thenReturn(supplierAssessment.referral)

      val exception = assertThrows<ResponseStatusException> {
        supplierAssessmentController.submitFeedback(referralId, token)
      }
      assertThat(exception.status).isEqualTo(HttpStatus.NOT_FOUND)
      assertThat(exception.message).contains("no current appointment exists on supplier assessment for referral")
    }
  }
}
