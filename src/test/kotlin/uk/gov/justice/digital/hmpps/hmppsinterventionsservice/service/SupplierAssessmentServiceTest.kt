package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service

import com.nhaarman.mockitokotlin2.any
import com.nhaarman.mockitokotlin2.argumentCaptor
import com.nhaarman.mockitokotlin2.atLeastOnce
import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.verify
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SupplierAssessment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AppointmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.AuthUserRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.ReferralRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository.SupplierAssessmentRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AuthUserFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.SupplierAssessmentFactory
import java.time.OffsetDateTime
import java.util.Optional.empty
import java.util.Optional.of
import java.util.UUID
import javax.persistence.EntityNotFoundException

class SupplierAssessmentServiceTest {
  private val supplierAssessmentRepository: SupplierAssessmentRepository = mock()
  private val referralRepository: ReferralRepository = mock()
  private val authUserRepository: AuthUserRepository = mock()
  private val appointmentRepository: AppointmentRepository = mock()

  private val authUserFactory = AuthUserFactory()
  private val referralFactory = ReferralFactory()
  private val appointmentFactory = AppointmentFactory()
  private val supplierAssessmentFactory = SupplierAssessmentFactory()

  private val supplierAssessmentService = SupplierAssessmentService(
    supplierAssessmentRepository,
    referralRepository,
    appointmentRepository,
    authUserRepository,
  )

  @Test
  fun `initial assessment can be created`() {
    val referral = referralFactory.createDraft()

    whenever(appointmentRepository.save(any())).thenReturn(appointmentFactory.create())
    whenever(supplierAssessmentRepository.save(any())).thenReturn(supplierAssessmentFactory.create())
    whenever(referralRepository.save(any())).thenReturn(referral)

    val response = supplierAssessmentService.createSupplierAssessment(referral)

    val argumentCaptor = argumentCaptor<SupplierAssessment>()
    verify(supplierAssessmentRepository, atLeastOnce()).save(argumentCaptor.capture())
    val arguments = argumentCaptor.firstValue

    assertThat(arguments.referral).isEqualTo(referral)
    assertThat(response.supplierAssessment).isNotNull
  }

  @Test
  fun `appointment can be added to an initial assessment`() {
    val referral = referralFactory.createSent()
    val supplierAssessment = supplierAssessmentFactory.createWithNoAppointment()
    referral.supplierAssessment = supplierAssessment
    val createdByUser = authUserFactory.create()
    val durationInMinutes = 60
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")

    whenever(appointmentRepository.save(any())).thenReturn(appointmentFactory.create())
    whenever(supplierAssessmentRepository.save(any())).thenReturn(supplierAssessmentFactory.create())
    whenever(authUserRepository.save(any())).thenReturn(createdByUser)
    whenever(supplierAssessmentRepository.findById(any())).thenReturn(of(supplierAssessment))

    supplierAssessmentService.createOrUpdateSupplierAssessmentAppointment(referral.id, durationInMinutes, appointmentTime, createdByUser)

    val argumentCaptor = argumentCaptor<Appointment>()
    verify(appointmentRepository, atLeastOnce()).save(argumentCaptor.capture())
    val arguments = argumentCaptor.firstValue

    assertThat(arguments.durationInMinutes).isEqualTo(durationInMinutes)
    assertThat(arguments.appointmentTime).isEqualTo(appointmentTime)
    assertThat(arguments.createdBy).isEqualTo(createdByUser)
  }

  @Test
  fun `initial assessment appointment can be updated`() {
    val referral = referralFactory.createSent()
    val supplierAssessment = supplierAssessmentFactory.create()
    referral.supplierAssessment = supplierAssessment
    val createdByUser = authUserFactory.create()
    val durationInMinutes = 120
    val appointmentTime = OffsetDateTime.parse("2020-12-04T10:42:43+00:00")

    whenever(authUserRepository.save(any())).thenReturn(createdByUser)
    whenever(supplierAssessmentRepository.save(any())).thenReturn(supplierAssessmentFactory.create())
    whenever(appointmentRepository.save(any())).thenReturn(referral.supplierAssessment!!.currentAppointment)
    whenever(supplierAssessmentRepository.findById(any())).thenReturn(of(supplierAssessment))

    supplierAssessmentService.createOrUpdateSupplierAssessmentAppointment(referral.id, durationInMinutes, appointmentTime, createdByUser)

    val argumentCaptor = argumentCaptor<Appointment>()
    verify(appointmentRepository, atLeastOnce()).save(argumentCaptor.capture())
    val arguments = argumentCaptor.firstValue

    assertThat(arguments.durationInMinutes).isEqualTo(durationInMinutes)
    assertThat(arguments.appointmentTime).isEqualTo(appointmentTime)
  }

  @Test
  fun `get supplier assessment throws error`() {
    val supplierAssessmentId = UUID.randomUUID()
    whenever(supplierAssessmentRepository.findById(any())).thenReturn(empty())

    val error = assertThrows<EntityNotFoundException> {
      supplierAssessmentService.getSupplierAssessmentById(supplierAssessmentId)
    }
    assertThat(error.message).contains("Supplier Assessment not found [id=$supplierAssessmentId]")
  }
}
