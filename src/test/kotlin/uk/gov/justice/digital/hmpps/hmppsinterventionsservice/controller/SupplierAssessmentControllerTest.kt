package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.web.server.ResponseStatusException
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.SupplierAssessmentService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.SupplierAssessmentFactory
import java.time.OffsetDateTime
import java.util.UUID

class SupplierAssessmentControllerTest {
  private val userMapper = mock<UserMapper>()
  private val referralService = mock<ReferralService>()
  private val supplierAssessmentService = mock<SupplierAssessmentService>()

  private val tokenFactory = JwtTokenFactory()
  private val authUserFactory = AuthUserFactory()
  private val referralFactory = ReferralFactory()
  private val supplierAssessmentFactory = SupplierAssessmentFactory()

  private val supplierAssessmentController = SupplierAssessmentController(supplierAssessmentService, referralService, userMapper)

  @Test
  fun `update supplier assessment appointment details`() {
    val referral = referralFactory.createSent()
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")
    val update = UpdateAppointmentDTO(appointmentTime, durationInMinutes)
    val user = authUserFactory.create()
    val token = tokenFactory.create()
    val supplierAssessment = supplierAssessmentFactory.create()

    whenever(userMapper.fromToken(token)).thenReturn(user)
    whenever(referralService.getSentReferralForUser(referral.id, user)).thenReturn(referral)
    whenever(supplierAssessmentService.updateSupplierAssessmentAppointment(referral, durationInMinutes, appointmentTime, user)).thenReturn(supplierAssessment)

    val response = supplierAssessmentController.updateSupplierAssessmentAppointment(referral.id, update, token)

    assertThat(response).isNotNull
    assertThat(response.appointmentTime).isEqualTo(supplierAssessment.appointment.appointmentTime)
    assertThat(response.durationInMinutes).isEqualTo(supplierAssessment.appointment.durationInMinutes)
  }

  @Test
  fun `get supplier assessment appointment`() {
    val referral = referralFactory.createSent()
    referral.supplierAssessment = supplierAssessmentFactory.create()
    val user = authUserFactory.create()
    val token = tokenFactory.create()

    whenever(userMapper.fromToken(token)).thenReturn(user)
    whenever(referralService.getSentReferralForUser(referral.id, user)).thenReturn(referral)

    val response = supplierAssessmentController.getSupplierAssessmentAppointment(referral.id, token)

    assertThat(response).isNotNull
  }

  @Test
  fun `no sent referral found for get supplier assessment appointment `() {
    val referralId = UUID.randomUUID()
    val user = authUserFactory.create()
    val token = tokenFactory.create()

    whenever(userMapper.fromToken(token)).thenReturn(user)
    whenever(referralService.getSentReferralForUser(referralId, user)).thenReturn(null)

    val e = assertThrows<ResponseStatusException> {
      supplierAssessmentController.getSupplierAssessmentAppointment(referralId, token)
    }
    assertThat(e.status).isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND)
    assertThat(e.message).contains("sent referral not found [id=$referralId]")
  }

  @Test
  fun `get appointment for supplier assessment with no appointment`() {
    val referral = referralFactory.createSent()
    referral.supplierAssessment = supplierAssessmentFactory.createWithNoAppointment()
    val user = authUserFactory.create()
    val token = tokenFactory.create()

    whenever(userMapper.fromToken(token)).thenReturn(user)
    whenever(referralService.getSentReferralForUser(referral.id, user)).thenReturn(referral)

    val e = assertThrows<ResponseStatusException> {
      supplierAssessmentController.getSupplierAssessmentAppointment(referral.id, token)
    }
    assertThat(e.status).isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND)
    assertThat(e.message).contains("no appointment found for supplier assessment [id=${referral.supplierAssessment!!.id}]")
  }
}
