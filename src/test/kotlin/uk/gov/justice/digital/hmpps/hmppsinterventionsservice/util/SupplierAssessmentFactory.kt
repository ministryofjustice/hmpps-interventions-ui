package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.util

import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Appointment
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.Referral
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.SupplierAssessment
import java.util.UUID

class SupplierAssessmentFactory(em: TestEntityManager? = null) : EntityFactory(em) {
  private val referralFactory = ReferralFactory(em)
  private val appointmentFactory = AppointmentFactory(em)

  fun create(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
    appointment: Appointment = appointmentFactory.create()
  ): SupplierAssessment {
    return save(
      SupplierAssessment(
        id = id,
        referral = referral,
        appointments = mutableSetOf(appointment),
      )
    )
  }

  fun createWithNoAppointment(
    id: UUID = UUID.randomUUID(),
    referral: Referral = referralFactory.createSent(),
  ): SupplierAssessment {
    return save(
      SupplierAssessment(
        id = id,
        referral = referral,
        appointments = mutableSetOf(),
      )
    )
  }
}
