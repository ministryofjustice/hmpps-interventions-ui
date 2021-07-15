package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.eq
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.times
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
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

  private val supplierAssessmentController = SupplierAssessmentController(supplierAssessmentService, userMapper, appointmentValidator, appointmentService)

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

  @Test
  fun `can record appointment behaviour`() {
    val appointmentId = UUID.randomUUID()
    val behaviourDescription = "description"
    val notifyProbationPractitioner = true
    val submittedBy = authUserFactory.create()
    val token = tokenFactory.create()

    val update = RecordAppointmentBehaviourDTO(behaviourDescription, notifyProbationPractitioner)

    val appointment = appointmentFactory.create()
    whenever(appointmentService.recordBehaviour(any(), any(), any(), any())).thenReturn(appointment)
    whenever(userMapper.fromToken(token)).thenReturn(submittedBy)

    val result = supplierAssessmentController.recordAppointmentBehaviour(appointmentId, update, token)

    assertThat(result).isNotNull
  }

  @Test
  fun `can record appointment attendance`() {
    val appointmentId = UUID.randomUUID()
    val attended = Attended.YES
    val additionalAttendanceInformation = "information"
    val submittedBy = authUserFactory.create()
    val token = tokenFactory.create()
    val update = UpdateAppointmentAttendanceDTO(attended, additionalAttendanceInformation)
    val appointment = appointmentFactory.create()

    whenever(appointmentService.recordAppointmentAttendance(any(), any(), any(), any())).thenReturn(appointment)
    whenever(userMapper.fromToken(token)).thenReturn(submittedBy)

    val result = supplierAssessmentController.recordAttendance(appointmentId, update, token)

    assertThat(result).isNotNull
  }

  @Test
  fun `can submit appointment feedback`() {
    val appointmentId = UUID.randomUUID()
    val submittedBy = authUserFactory.create()
    val token = tokenFactory.create()
    val appointment = appointmentFactory.create()

    whenever(appointmentService.submitSessionFeedback(any(), any())).thenReturn(appointment)
    whenever(userMapper.fromToken(token)).thenReturn(submittedBy)

    val result = supplierAssessmentController.submitFeedback(appointmentId, token)

    assertThat(result).isNotNull
  }
}
