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
import javax.validation.constraints.NotNull

@Entity
data class ActionPlanSession(

  @JoinTable(
    name = "action_plan_session_appointment",
    joinColumns = [JoinColumn(name = "action_plan_session_id")],
    inverseJoinColumns = [JoinColumn(name = "appointment_id")]
  )
  @NotNull @OneToMany @Fetch(FetchMode.JOIN) val appointments: MutableSet<Appointment> = mutableSetOf(),
  @NotNull val sessionNumber: Int,

  @NotNull @ManyToOne val actionPlan: ActionPlan,
  @Id val id: UUID,
  @ManyToOne val referral: Referral?,
) {
  // this class is designed to allow multiple appointments per session,
  // however this functionality is not currently used. to make life
  // easier for users of this class this getter returns the most recently
  // created appointment or null if no appointments have been created.
  val currentAppointment: Appointment?
    get() = appointments.maxByOrNull { it.createdAt }
}
