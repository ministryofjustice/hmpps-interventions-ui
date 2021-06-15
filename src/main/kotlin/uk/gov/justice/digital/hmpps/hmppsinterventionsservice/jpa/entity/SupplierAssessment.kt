package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.OneToMany
import javax.persistence.OneToOne
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Entity
@Table(name = "supplier_assessment")
data class SupplierAssessment(
  @Id val id: UUID,
  @NotNull @OneToOne val referral: Referral,

  @JoinTable(
    name = "supplier_assessment_appointment",
    joinColumns = [JoinColumn(name = "supplier_assessment_id")],
    inverseJoinColumns = [JoinColumn(name = "appointment_id")]
  )
  @NotNull @OneToMany @Fetch(FetchMode.JOIN) val appointments: MutableSet<Appointment> = mutableSetOf(),
) {
  val currentAppointment: Appointment
    get() = appointments.maxByOrNull { it.createdAt }!!
}
