package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanAppointment
import java.util.UUID

interface ActionPlanAppointmentRepository : JpaRepository<ActionPlanAppointment, UUID> {
  fun findAllByActionPlanId(actionPlanId: UUID): List<ActionPlanAppointment>
  fun findByActionPlanIdAndSessionNumber(actionPlanId: UUID, sessionNumber: Int): ActionPlanAppointment?
  fun countByActionPlanIdAndAttendedIsNotNull(actionPlanId: UUID): Int
}
