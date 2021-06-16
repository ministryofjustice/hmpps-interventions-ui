package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.controller

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.authorization.UserMapper
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.dto.UpdateAppointmentDTO
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.ReferralService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.SupplierAssessmentService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.JwtTokenFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.SupplierAssessmentFactory
import java.time.OffsetDateTime

class SupplierAssessmentControllerTest {
  private val userMapper = mock<UserMapper>()
  private val referralService = mock<ReferralService>()
  private val supplierAssessmentService = mock<SupplierAssessmentService>()

  private val tokenFactory = JwtTokenFactory()
  private val authUserFactory = AuthUserFactory()
  private val referralFactory = ReferralFactory()
  private val supplierAssessmentFactory = SupplierAssessmentFactory()

  private val supplierAssessmentController = SupplierAssessmentController(supplierAssessmentService, userMapper)

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
    whenever(supplierAssessmentService.scheduleOrUpdateSupplierAssessmentAppointment(referral.id, durationInMinutes, appointmentTime, user)).thenReturn(supplierAssessment.currentAppointment)

    val response = supplierAssessmentController.updateSupplierAssessmentAppointment(referral.id, update, token)

    assertThat(response).isNotNull
  }
}
