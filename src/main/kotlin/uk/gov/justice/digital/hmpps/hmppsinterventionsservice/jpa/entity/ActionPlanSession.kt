package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity

import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.ManyToOne
import javax.persistence.OneToMany
import javax.validation.constraints.NotNull

@Entity
data class ActionPlanSession(
  @NotNull @OneToMany @Fetch(FetchMode.JOIN) val appointments: MutableSet<Appointment> = mutableSetOf(),
  @NotNull val sessionNumber: Int,

  @NotNull @ManyToOne val actionPlan: ActionPlan,
  @Id val id: UUID,
) {
  // this class is designed to allow multiple appointments per session,
  // however this functionality is not currently used. to make life
  // easier for users of this class this getter returns the most recently
  // created appointment or null if no appointments have been created.
  val currentAppointment: Appointment?
    get() = appointments.maxByOrNull { it.createdAt }
}
