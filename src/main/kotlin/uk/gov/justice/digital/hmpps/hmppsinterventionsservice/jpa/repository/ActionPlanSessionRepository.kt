package uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.repository

import org.springframework.data.jpa.repository.JpaRepository
import uk.gov.justice.digital.hmpps.hmppsinterventionsservice.jpa.entity.ActionPlanSession
import java.util.UUID

interface ActionPlanSessionRepository : JpaRepository<ActionPlanSession, UUID> {
  fun findAllByActionPlanId(actionPlanId: UUID): List<ActionPlanSession>
  fun findByActionPlanIdAndSessionNumber(actionPlanId: UUID, sessionNumber: Int): ActionPlanSession?
  fun countByActionPlanIdAndAttendedIsNotNull(actionPlanId: UUID): Int
}
