package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.JoinTable
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.persistence.Table
import javax.validation.constraints.NotNull

@Entity
@Table(name = "delivery_session")
data class DeliverySession(

  @JoinTable(
    name = "action_plan_session_appointment",
    joinColumns = [JoinColumn(name = "action_plan_session_id")],
    inverseJoinColumns = [JoinColumn(name = "appointment_id")]
  )
  @NotNull @OneToMany @Fetch(FetchMode.JOIN) val appointments: MutableSet<Appointment> = mutableSetOf(),
  @NotNull val sessionNumber: Int,

  @ManyToOne val referral: Referral,
  @Id val id: UUID,
) {
  // this class is designed to allow multiple appointments per session,
  // however this functionality is not currently used. to make life
  // easier for users of this class this getter returns the most recently
  // created appointment or null if no appointments have been created.
  val currentAppointment: Appointment?
    get() = appointments.maxByOrNull { it.createdAt }
}
