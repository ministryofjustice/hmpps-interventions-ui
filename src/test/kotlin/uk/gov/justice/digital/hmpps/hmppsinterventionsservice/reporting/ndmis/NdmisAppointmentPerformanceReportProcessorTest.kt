package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis

import com.nhaarman.mockitokotlin2.mock
import com.nhaarman.mockitokotlin2.whenever
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ComplexityLevel
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance.NdmisAppointmentPerformanceReportProcessor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.reporting.ndmis.performance.NdmisComplexityPerformanceReportProcessor
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.service.DeliverySessionService
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.AppointmentFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.DeliverySessionFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ReferralFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.ServiceCategoryFactory
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util.SupplierAssessmentFactory
import java.util.*

internal class NdmisAppointmentPerformanceReportProcessorTest {
  private val deliverySessionService = mock<DeliverySessionService>()
  private val processor = NdmisAppointmentPerformanceReportProcessor(deliverySessionService)

  private val referralFactory = ReferralFactory()
  private val deliverySessionFactory = DeliverySessionFactory()
  private val appointmentFactory = AppointmentFactory()
  private val supplierAssessmentFactory = SupplierAssessmentFactory()

  @Test
  fun `will not process draft referrals`() {
    val referral = referralFactory.createDraft()

    assertThrows<RuntimeException> { processor.process(referral) }
  }

  @Test
  fun `referrals with multiple delivery session and saa appointments can be processed`(){
    val referral = referralFactory.createSent()

    val appointment1 = appointmentFactory.create(referral = referral)
    val appointment2 = appointmentFactory.create(referral = referral)
    val deliverySession1 = deliverySessionFactory.createUnscheduled(referral = referral, appointments = mutableSetOf(appointment1, appointment2))

    val appointment3 = appointmentFactory.create(referral = referral)
    val deliverySession2 = deliverySessionFactory.createUnscheduled(referral = referral, appointments = mutableSetOf(appointment3))

    val appointment4 = appointmentFactory.create(referral = referral)
    val appointment5 = appointmentFactory.create(referral = referral)
    val supplierAssessment = supplierAssessmentFactory.createWithMultipleAppointments(
      referral = referral,
      appointments = mutableSetOf(appointment4, appointment5
      )
    )

    referral.supplierAssessment = supplierAssessment

    whenever(deliverySessionService.getSessions(referral.id)).thenReturn(listOf(deliverySession1, deliverySession2))

    val result = processor.process(referral)

    assertThat(result!!.size).isEqualTo(5)
    assertThat(result[0].reasonForAppointment).isEqualTo("delivery")
    assertThat(result[1].reasonForAppointment).isEqualTo("delivery")
    assertThat(result[2].reasonForAppointment).isEqualTo("delivery")
    assertThat(result[3].reasonForAppointment).isEqualTo("saa")
    assertThat(result[4].reasonForAppointment).isEqualTo("saa")
    }

  @Test
  fun `referrals with no saa appointments and no delivery sessions can be processed`(){
    val referral = referralFactory.createSent()

    val supplierAssessment = supplierAssessmentFactory.createWithNoAppointment(
      referral = referral,
    )
    referral.supplierAssessment = supplierAssessment

    whenever(deliverySessionService.getSessions(referral.id)).thenReturn(emptyList())

    val result = processor.process(referral)

    assertThat(result).isNull()
  }

  @Test
  fun `referrals with saa appointments and no delivery sessions can be processed`(){
    val referral = referralFactory.createSent()

    val appointment1 = appointmentFactory.create(referral = referral)
    val appointment2 = appointmentFactory.create(referral = referral)
    val supplierAssessment = supplierAssessmentFactory.createWithMultipleAppointments(
      referral = referral,
      appointments = mutableSetOf(appointment1, appointment2)
    )

    referral.supplierAssessment = supplierAssessment

    whenever(deliverySessionService.getSessions(referral.id)).thenReturn(emptyList())

    val result = processor.process(referral)

    assertThat(result!!.size).isEqualTo(2)
    assertThat(result[0].reasonForAppointment).isEqualTo("saa")
    assertThat(result[1].reasonForAppointment).isEqualTo("saa")
  }
}
